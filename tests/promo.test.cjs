const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');

test('demo defers its poster until opened and retains native link and close behavior', () => {
  const html = fs.readFileSync((process.env.SITE_BUILD || 'public') + '/index.html', 'utf8');
  const videoTag = html.match(/<video\b[^>]*>/)[0];
  assert.doesNotMatch(videoTag, /\sposter=/);
  assert.match(videoTag, /\sdata-poster=/);
  assert.match(videoTag, /\spreload=["']?none/);
  const events = {};
  const attrs = new Map([['data-poster', '/images/promo/know-your-profit.png']]);
  let opens = 0, pauses = 0, focuses = 0, prevented = 0;
  const video = {
    hasAttribute: key => attrs.has(key), getAttribute: key => attrs.get(key),
    setAttribute: (key, value) => attrs.set(key, value), pause: () => pauses++,
  };
  const trigger = {setAttribute() {}, addEventListener: (key, fn) => events['trigger-' + key] = fn,
    focus: () => focuses++};
  const close = {addEventListener: (key, fn) => events['close-' + key] = fn};
  const dialog = {id: 'ff-demo', showModal: () => opens++, close: () => events.close(),
    querySelector: selector => selector === 'video' ? video : close,
    addEventListener: (key, fn) => events[key] = fn};
  vm.runInNewContext(fs.readFileSync('assets/js/promo.js', 'utf8'), {
    document: {getElementById: id => id === 'ff-demo-open' ? trigger : dialog},
  });
  assert.equal(attrs.has('poster'), false);
  events['trigger-click']({ctrlKey: true, preventDefault: () => prevented++});
  assert.equal(opens, 0); assert.equal(prevented, 0); assert.equal(attrs.has('poster'), false);
  events['trigger-click']({preventDefault: () => prevented++});
  assert.equal(opens, 1); assert.equal(prevented, 1);
  assert.equal(attrs.get('poster'), '/images/promo/know-your-profit.png');
  events['close-click']();
  assert.equal(pauses, 1); assert.equal(focuses, 1);
});
