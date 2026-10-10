const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

test('production website exposes the approved dashboard entry links', () => {
  const config = JSON.parse(fs.readFileSync('data/acquisition.json', 'utf8'));
  assert.equal(config.webSignupEnabled, true);
  const built = process.env.SITE_BUILD || 'public';
  for (const page of ['index.html', 'calculator/index.html', 'product/index.html']) {
    const html = fs.readFileSync(path.join(built, page), 'utf8');
    assert.match(html, /<a\b[^>]*data-ff-platform=["']?web\b/);
    assert.doesNotMatch(html, /href=["']?http:\/\/(?:127\.0\.0\.1|localhost):321[012]/);
  }
});

test('production desktop promotion follows the valid launch link, not development environment', () => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'flipfinds-launch-'));
  // Temporary copies only: the source launch flag remains disabled.
  const data = path.join(fixture, 'data');
  fs.cpSync('data', data, { recursive: true });
  const config = JSON.parse(fs.readFileSync(path.join(data, 'acquisition.json'), 'utf8'));
  const overlay = path.join(fixture, 'config.json');
  fs.writeFileSync(overlay, JSON.stringify({ dataDir: data }));
  for (const url of ['https://app.flipfinds.net/start', 'https://unapproved.example/start']) {
    fs.writeFileSync(path.join(data, 'acquisition.json'), JSON.stringify({ ...config, webSignupEnabled: true, webSignupUrl: url }));
    const destination = path.join(fixture, url.includes('unapproved') ? 'rejected' : 'enabled');
    const result = spawnSync('hugo', ['--environment', 'production', '--config', `hugo.toml,${overlay}`, '--destination', destination], { encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    const html = fs.readFileSync(path.join(destination, 'index.html'), 'utf8');
    if (url.includes('unapproved')) assert.doesNotMatch(html, /id="workspace-title"/);
    else {
      assert.match(html, /id="workspace-title"/);
      assert.match(html, /https:\/\/app\.flipfinds\.net\/start\?mode=signin/);
      assert.doesNotMatch(html, /http:\/\/(?:localhost|127\.0\.0\.1):3213/);
    }
  }
});
