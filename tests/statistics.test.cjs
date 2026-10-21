const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { DatabaseSync } = require('node:sqlite');
const config = require('../data/measurement.json');
const source = fs.readFileSync('assets/js/measurement.js', 'utf8');

function browser(options = {}) {
  const values = new Map(Object.entries(options.saved || {})), calls = [], listeners = {}, video = {};
  const toggle = { checked: false, addEventListener: (e, fn) => listeners['toggle-' + e] = fn };
  const status = {};
  const storage = { getItem: k => { if (options.storageError) throw Error(); return values.get(k) || null; },
    setItem: (k, v) => values.set(k, v), removeItem: k => values.delete(k) };
  const window = { FFPage: { page_type: 'calculator', intent: 'ebay_profit', page_path: '/private?amount=99' },
    FFMeasurementConfig: { ...config, endpoint: 'https://metrics.example/collect', ...options.config },
    sessionStorage: storage, matchMedia: () => ({ matches: !!options.mobile }),
    addEventListener: (e, fn) => listeners[e] = fn, setTimeout: fn => fn(),
    performance: { getEntriesByType: () => [{ duration: options.duration || 2500 }] } };
  const document = { visibilityState: 'visible', getElementById: id => id === 'ffStatisticsDisabled' ? toggle : status,
    querySelector: () => ({ addEventListener: (e, fn) => video[e] = fn }),
    addEventListener: (e, fn) => listeners[e] = fn };
  vm.runInNewContext(source, { window, document, navigator: options.navigator || {},
    location: { hostname: options.hostname || 'flipfinds.net' }, localStorage: storage, URL,
    fetch: (url, opts) => { calls.push({ url, ...opts, payload: JSON.parse(opts.body) }); return Promise.resolve(); } });
  listeners.DOMContentLoaded();
  return { window, calls, listeners, values, toggle, status, video };
}

test('statistics are aggregate, bounded, once per event/detail per load and contain no input/URL data', () => {
  const b = browser({ mobile: true });
  assert.equal(b.calls.length, 1);
  assert.equal(b.window.ffTrack('calculator_started', { amount: 999, title: 'secret' }), true);
  assert.equal(b.window.ffTrack('calculator_started'), false);
  assert.equal(b.window.ffTrack('resource_downloaded', { resource_name: 'private' }), false);
  assert.equal(b.window.ffTrack('constructor'), false);
  assert.equal(b.window.ffTrack('ios_app_store_cta_clicked', { cta_placement: 'home_hero', prompt: 'secret' }), true);
  for (const call of b.calls) {
    assert.deepEqual(Object.keys(call.payload).sort(), ['detail', 'device', 'event', 'page', 'tool']);
    assert.equal(call.payload.device, 'mobile'); assert.equal(call.payload.tool, 'ebay_profit');
    assert.equal(call.credentials, 'omit'); assert.equal(call.referrerPolicy, 'no-referrer');
    assert.doesNotMatch(call.body, /secret|private|999|amount|page_path/);
  }
  assert.equal(b.values.size, 0, 'No identifier or attribution storage');
});

test('opt-out, legacy decline, browser signals, unavailable storage and previews suppress collection', () => {
  for (const opts of [{ saved: { ff_statistics_disabled: '1' } }, { saved: { ff_website_analytics_consent: 'denied' } },
    { navigator: { globalPrivacyControl: true } }, { navigator: { doNotTrack: '1' } },
    { storageError: true }, { hostname: 'localhost' }, { config: { endpoint: '' } }]) {
    const b = browser(opts); b.window.ffTrack('calculator_completed'); b.listeners.load(); b.video.play();
    assert.equal(b.calls.length, 0, JSON.stringify(opts));
  }
  const b = browser(); b.toggle.checked = true; b.listeners['toggle-change']();
  const count = b.calls.length;
  assert.equal(b.window.ffTrack('calculator_completed'), false);
  assert.equal(b.values.get('ff_statistics_disabled'), '1');
  assert.equal(b.calls.length, count);
  b.toggle.checked = false; b.listeners['toggle-change']();
  assert.equal(b.window.ffTrack('calculator_completed'), true);
  b.values.set('ff_statistics_disabled', '1'); b.listeners.storage({ key: 'ff_statistics_disabled' });
  assert.equal(b.window.ffTrack('demo_started'), false);
});

test('video events and coarse load duration are counted without playback or timing histories', () => {
  const b = browser(); b.video.play(); b.video.play(); b.video.ended(); b.video.error(); b.listeners.load();
  assert.deepEqual(b.calls.map(x => x.payload.event), ['page_loaded', 'demo_started', 'demo_completed', 'demo_failed', 'page_load_speed']);
  assert.equal(b.calls.at(-1).payload.detail, '2_to_4s');
});

async function collector() {
  const module = await import('../worker/measurement/collector.mjs');
  const db = new DatabaseSync(':memory:');
  db.exec(fs.readFileSync('worker/measurement/schema.sql', 'utf8'));
  const env = { COUNTS: { prepare: sql => {
    const statement = db.prepare(sql);
    return { bind: (...args) => ({ run: async () => statement.run(...args) }), run: async () => statement.run() };
  } }, INGEST_LIMIT: { limit: async () => ({ success: true }) } };
  function request(data, headers = {}, path = '/collect', method = 'POST') {
    return new Request('https://collector.example' + path, { method,
      headers: { Origin: 'https://flipfinds.net', 'Content-Type': 'text/plain', ...headers },
      ...(method === 'POST' ? { body: typeof data === 'string' ? data : JSON.stringify(data) } : {}) });
  }
  return { worker: module.default, db, env, request };
}
const event = { event: 'calculator_completed', page: 'calculator', tool: 'ebay_profit', device: 'desktop', detail: 'none' };

test('collector increments a single SQL aggregate and has no public reporting endpoint', async () => {
  const { worker, db, env, request } = await collector();
  for (let i = 0; i < 2; i++) assert.equal((await worker.fetch(request(event), env)).status, 204);
  const rows = db.prepare('SELECT * FROM daily_counts').all();
  assert.equal(rows.length, 1); assert.equal(rows[0].total, 2);
  assert.deepEqual(Object.keys(rows[0]).sort(), ['day', 'detail', 'device', 'event', 'page', 'tool', 'total']);
  assert.equal((await worker.fetch(request(null, {}, '/report', 'GET'), env)).status, 404);
  assert.equal((await worker.fetch(request(null, {}, '/collect', 'GET'), env)).status, 405);
  db.close();
});

test('collector rejects extra/private fields, malformed data, unknown labels and large streamed bodies', async () => {
  const { worker, db, env, request } = await collector();
  for (const data of [{ ...event, amount: 10 }, { ...event, page: '/private' }, { ...event, detail: 'email@example.com' },
    { ...event, event: 'constructor' }, { ...event, page: 'home' }, [], null, '{', 'x'.repeat(513)])
    assert.equal((await worker.fetch(request(data), env)).status, 400);
  for (const headers of [{ Origin: 'https://evil.example' }, { Origin: 'null' }])
    assert.equal((await worker.fetch(request(event, headers), env)).status, 404);
  assert.equal((await worker.fetch(request(event, {}, '/collect?private=1'), env)).status, 404);
  for (const headers of [{ 'Sec-GPC': '1' }, { DNT: '1' }])
    assert.equal((await worker.fetch(request(event, headers), env)).status, 204);
  assert.equal(db.prepare('SELECT COUNT(*) AS n FROM daily_counts').get().n, 0);
  env.INGEST_LIMIT.limit = async () => ({ success: false });
  assert.equal((await worker.fetch(request(event), env)).status, 429);
  delete env.INGEST_LIMIT;
  assert.equal((await worker.fetch(request(event), env)).status, 503);
  db.close();
});

test('collector expiry deletes old totals while preserving recent aggregates', async () => {
  const { worker, db, env, request } = await collector();
  await worker.fetch(request(event), env);
  db.prepare("INSERT INTO daily_counts VALUES('2000-01-01','page_loaded','home','none','desktop','none',1)").run();
  await worker.scheduled({}, env);
  const rows = db.prepare('SELECT day FROM daily_counts').all();
  assert.equal(rows.length, 1); assert.notEqual(rows[0].day, '2000-01-01');
  db.close();
});
