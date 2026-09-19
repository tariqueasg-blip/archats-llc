/* Archats — analytics layer
 * Goals: (1) count visitors, (2) tag where each one came from,
 * (3) ring a bell on real conversions (form, phone tap, chat lead).
 * GA4 loads only when a real Measurement ID is set below; until then it
 * runs in "preview" mode and logs events to the console so nothing calls out.
 */
(function () {
  'use strict';

  // ────────────────────────────────────────────────────────────
  // 1. CONFIG — paste your real GA4 Measurement ID here (G-XXXXXXXXXX)
  //    Get it free at https://analytics.google.com → Admin → Data Streams.
  // ────────────────────────────────────────────────────────────
  var GA4_ID = 'G-HEC2K6R6JC';

  var params = new URLSearchParams(location.search);
  var live = /^G-[A-Z0-9]{6,}$/.test(GA4_ID) && GA4_ID.indexOf('XXX') === -1;
  var DEBUG = params.get('analytics_debug') === '1' || !live;

  // ────────────────────────────────────────────────────────────
  // 2. CAPTURE WHERE THE VISITOR CAME FROM (once per session)
  //    Reads utm_* / gclid from the URL and the referrer, then remembers.
  // ────────────────────────────────────────────────────────────
  var KEY = 'archats_src';
  function stored() {
    try { return JSON.parse(sessionStorage.getItem(KEY)) || null; } catch (e) { return null; }
  }
  function capture() {
    var prev = stored() || {};
    var s = {
      utm_source: params.get('utm_source') || prev.utm_source || '',
      utm_medium: params.get('utm_medium') || prev.utm_medium || '',
      utm_campaign: params.get('utm_campaign') || prev.utm_campaign || '',
      gclid: params.get('gclid') || prev.gclid || '',
      referrer: prev.referrer || document.referrer || 'direct',
      landing: prev.landing || location.pathname
    };
    try { sessionStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {}
    return s;
  }
  var source = capture();

  // Human-readable origin, e.g. "Google Ads", "facebook / social", "direct".
  function label() {
    if (source.gclid) return 'Google Ads';
    if (source.utm_source) return source.utm_source + (source.utm_medium ? ' / ' + source.utm_medium : '');
    try {
      if (source.referrer && source.referrer !== 'direct') return new URL(source.referrer).hostname;
    } catch (e) {}
    return 'direct';
  }

  // ────────────────────────────────────────────────────────────
  // 3. LOAD GOOGLE ANALYTICS (only when a real ID is present)
  // ────────────────────────────────────────────────────────────
  if (live) {
    var gs = document.createElement('script');
    gs.async = true;
    gs.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(gs);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID);
  } else {
    window.gtag = function () {}; // preview: no network calls
  }

  // ────────────────────────────────────────────────────────────
  // 4. PUBLIC API
  // ────────────────────────────────────────────────────────────
  function track(name, extra) {
    var payload = Object.assign({
      origin: label(),
      utm_source: source.utm_source,
      utm_medium: source.utm_medium,
      utm_campaign: source.utm_campaign,
      gclid: source.gclid
    }, extra || {});
    if (DEBUG) console.log('[archats:analytics]', name, payload);
    try { window.gtag('event', name, payload); } catch (e) {}
  }

  window.Archats = {
    track: track,
    label: label,
    source: source,
    ga4Id: GA4_ID,
    live: live
  };

  // ────────────────────────────────────────────────────────────
  // 5. PHONE TAPS — the biggest conversion for a renovation business.
  //    Delegated so it catches every tel: link (header, contact, footer).
  // ────────────────────────────────────────────────────────────
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="tel:"]') : null;
    if (a) track('phone_click', { where: (a.className || 'tel-link').toString().slice(0, 60) });
  }, true);
})();
