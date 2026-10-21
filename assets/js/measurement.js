/* global window, document, navigator, location, localStorage, fetch, URL */
(function () {
  var config = window.FFMeasurementConfig || {};
  var page = window.FFPage || {};
  var key = 'ff_statistics_disabled';
  var disabled = true;
  var blocked = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  var seen = new Set();
  var endpoint = '';
  try {
    disabled = localStorage.getItem(key) === '1' ||
      localStorage.getItem('ff_website_analytics_consent') === 'denied';
    var url = new URL(config.endpoint);
    if (location.hostname === 'flipfinds.net' && url.protocol === 'https:' &&
        !url.username && !url.password && !url.search && !url.hash) endpoint = url.href;
  } catch { /* Without readable preferences or a configured endpoint, do not collect. */ }
  var pageType = config.pages.indexOf(page.page_type) !== -1 ? page.page_type : 'other';
  var tool = pageType === 'calculator' && config.tools.indexOf(page.intent) !== -1 ? page.intent : 'none';
  var device = window.matchMedia('(max-width: 767px)').matches ? 'mobile' : 'desktop';
  function placement(value) {
    if (typeof value !== 'string') return 'other';
    if (/header|^nav/.test(value)) return 'header';
    if (/hero/.test(value)) return 'hero';
    if (/footer/.test(value)) return 'footer';
    if (/result/.test(value)) return 'result';
    if (/content|page|cta|workspace/.test(value)) return 'content';
    return 'other';
  }
  window.ffTrack = function (name, params) {
    if (disabled || blocked || !endpoint || document.visibilityState === 'prerender') return false;
    if (!Object.prototype.hasOwnProperty.call(config.events, name)) return false;
    params = params || {};
    var detail = 'none';
    if (/_cta_clicked$/.test(name) || name === 'dashboard_opened' || name === 'pro_opened')
      detail = placement(params.cta_placement);
    if (name === 'resource_downloaded') detail = params.resource_name;
    if (name === 'page_load_speed') detail = params.speed_bucket;
    if (config.events[name].indexOf(detail) === -1) return false;
    var once = name + ':' + detail;
    if (seen.has(once)) return false;
    seen.add(once);
    var payload = { event: name, page: pageType, tool: tool, device: device, detail: detail };
    // Never queue a history, retry across visits or send URL/input/error contents.
    try {
      fetch(endpoint, { method: 'POST', mode: 'cors', credentials: 'omit',
        referrerPolicy: 'no-referrer', keepalive: true,
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, body: JSON.stringify(payload)
      }).catch(function () {});
      return true;
    } catch { return false; }
  };
  function renderChoice() {
    var toggle = document.getElementById('ffStatisticsDisabled');
    var status = document.getElementById('ffStatisticsStatus');
    if (toggle) { toggle.checked = disabled || blocked; toggle.disabled = blocked; }
    if (status) status.textContent = blocked ? 'Statistics are off because of your browser privacy setting.' :
      disabled ? 'Statistics are off in this browser.' : 'Basic aggregate statistics are allowed in this browser.';
  }
  document.addEventListener('DOMContentLoaded', function () {
    renderChoice();
    var toggle = document.getElementById('ffStatisticsDisabled');
    if (toggle) toggle.addEventListener('change', function () {
      disabled = toggle.checked;
      try {
        localStorage.setItem(key, disabled ? '1' : '0');
        if (!disabled) localStorage.removeItem('ff_website_analytics_consent');
        localStorage.removeItem('ff_acquisition_first');
        window.sessionStorage.removeItem('ff_acquisition_current');
      } catch { disabled = true; }
      seen.clear(); renderChoice();
    });
    window.ffTrack('page_loaded');
    var video = document.querySelector('#ff-demo video');
    if (video) ['play', 'ended', 'error'].forEach(function (event, i) {
      video.addEventListener(event, function () {
        window.ffTrack(['demo_started', 'demo_completed', 'demo_failed'][i]);
      });
    });
  });
  window.addEventListener('storage', function (event) {
    if (event.key === key || event.key === 'ff_website_analytics_consent' || event.key === null) {
      try { disabled = localStorage.getItem(key) === '1' || localStorage.getItem('ff_website_analytics_consent') === 'denied'; }
      catch { disabled = true; }
      renderChoice();
    }
  });
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      var entries = window.performance && window.performance.getEntriesByType('navigation');
      var duration = entries && entries[0] && entries[0].duration;
      if (!(duration > 0)) return;
      window.ffTrack('page_load_speed', { speed_bucket: duration < 2000 ? 'under_2s' : duration <= 4000 ? '2_to_4s' : 'over_4s' });
    }, 0);
  });
})();
