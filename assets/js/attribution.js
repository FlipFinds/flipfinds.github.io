/* global window, module */
(function (root, factory) {
  var api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.FFAttribution = api;
})(typeof window === 'undefined' ? globalThis : window, function () {
  var sources = [
    'google',
    'bing',
    'newsletter',
    'instagram',
    'facebook',
    'youtube',
    'partner',
    'flipfinds_web',
    'website',
    'embed',
  ];
  var media = ['organic', 'referral', 'email', 'social', 'website', 'cpc', 'paid_social'];
  function sanitize(search, config) {
    var params = new URLSearchParams(search),
      out = {};
    var allowed = {
      utm_source: sources,
      utm_medium: media,
      utm_campaign: Object.values(config.campaigns || {}),
    };
    Object.keys(allowed).forEach(function (key) {
      var value = params.get(key);
      if (allowed[key].indexOf(value) !== -1) out[key] = value;
    });
    return out;
  }
  function load(storage, key, config) {
    try {
      return sanitize(
        new URLSearchParams(JSON.parse(storage.getItem(key) || '{}')).toString(),
        config
      );
    } catch {
      return {};
    }
  }
  function capture(firstStorage, sessionStorage, search, referrer, config) {
    var current = sanitize(search, config);
    if (!Object.keys(current).length)
      current = load(sessionStorage, 'ff_acquisition_current', config);
    if (!Object.keys(current).length) {
      try {
        var host = new URL(referrer).hostname;
        if (['www.google.com', 'google.com', 'www.bing.com', 'bing.com'].indexOf(host) !== -1)
          current = {
            utm_source: host.indexOf('bing') !== -1 ? 'bing' : 'google',
            utm_medium: 'organic',
          };
      } catch {}
    }
    var first = load(firstStorage, 'ff_acquisition_first', config);
    try {
      if (Object.keys(current).length)
        sessionStorage.setItem('ff_acquisition_current', JSON.stringify(current));
      if (!Object.keys(first).length && Object.keys(current).length) {
        first = current;
        firstStorage.setItem('ff_acquisition_first', JSON.stringify(first));
      }
    } catch {}
    return { first: first, current: current };
  }
  function handoff(base, context, config) {
    var url = new URL(base);
    if (url.protocol !== 'https:') return null;
    ['first', 'current'].forEach(function (touch) {
      var clean = sanitize(new URLSearchParams(context[touch] || {}).toString(), config);
      Object.keys(clean).forEach(function (key) {
        url.searchParams.set('ff_' + touch + '_' + key, clean[key]);
      });
    });
    return url.href;
  }
  return { sanitize: sanitize, capture: capture, handoff: handoff };
});
