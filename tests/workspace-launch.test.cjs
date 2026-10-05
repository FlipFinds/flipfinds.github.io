const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('normal website build keeps all dashboard entry links disabled', () => {
  const config = JSON.parse(fs.readFileSync('data/acquisition.json', 'utf8'));
  assert.equal(config.webSignupEnabled, false);
  const built = process.env.SITE_BUILD || 'public';
  for (const page of ['index.html', 'calculator/index.html', 'product/index.html']) {
    const html = fs.readFileSync(path.join(built, page), 'utf8');
    assert.doesNotMatch(html, /<a\b[^>]*data-ff-platform=["']?web\b/);
    assert.doesNotMatch(html, /href=["']?http:\/\/127\.0\.0\.1:3210/);
  }
});
