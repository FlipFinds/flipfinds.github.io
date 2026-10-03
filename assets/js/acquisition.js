(function () {
  var config = window.FFAcquisition || {};
  var android = /Android/i.test(navigator.userAgent);
  var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (/Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
  var preferred = android ? "android" : ios ? "ios" : config.webSignupEnabled ? "web" : "";
  document.querySelectorAll("[data-ff-store-group]").forEach(function (group) {
    var link = group.querySelector('[data-ff-platform="' + preferred + '"]');
    if (link) { link.classList.add("ff-device-primary"); group.prepend(link); }
  });
  document.addEventListener("click", function (event) {
    var link = event.target.closest && event.target.closest("a[href]");
    if (!link || !window.ffTrack) return;
    var url;
    try { url = new URL(link.href, location.origin); } catch (e) { return; }
    var placement = link.dataset.source || link.dataset.ffTrack || "content_link";
    if (link.dataset.ffPlatform==='web' && config.webSignupEnabled && config.webSignupUrl && window.FFAttribution) {
      var handoff=window.FFAttribution.handoff(config.webSignupUrl,window.FFAttributionContext||{},config);
      if(handoff)link.href=handoff;
      window.ffTrack('web_signup_started',{cta_placement:placement,destination:'web_signup'});
    } else if (url.hostname === "apps.apple.com" && url.pathname.indexOf("/id" + config.appId) !== -1) {
      window.ffTrack("ios_app_store_cta_clicked", {cta_placement:placement,destination:"app_store"});
    } else if (url.hostname === "play.google.com" && url.searchParams.get("id") === config.packageId) {
      window.ffTrack("android_play_store_cta_clicked", {cta_placement:placement,destination:"google_play"});
    } else if (link.dataset.resource) {
      window.ffTrack("resource_downloaded", {resource_name:link.dataset.resource,cta_placement:placement,destination:"resource"});
    } else if (url.origin === location.origin) {
      window.ffTrack("internal_navigation_clicked", {cta_placement:placement,destination:"internal"});
    }
  });
})();
