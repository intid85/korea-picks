/*!
 * K-Pantry Scanner: US K-Food Allergy, Gluten-Free, Vegan, Halal & Scoville Encyclopedia
 * Invisible Pageview Tracker (Abacus Namespace: kpantry-korea-2026)
 * - 100% invisible to normal visitors
 * - Tracks daily (day__YYYY-MM-DD__<slug> and day__YYYY-MM-DD__all_site) + cumulative (total__<slug> and total__all_site) in KST (UTC+9)
 * - Owner-only admin bar available via ?admin=9616
 */
(function () {
  'use strict';

  var NAMESPACE = 'kpantry-korea-2026';
  var API_BASE = 'https://abacus.jasoncameron.dev';

  function fnv1aHex8(str) {
    var h = 0x811c9dc5;
    var bytes = new TextEncoder().encode(str);
    for (var i = 0; i < bytes.length; i++) {
      h ^= bytes[i];
      h = Math.imul(h, 0x01000193) >>> 0;
    }
    return h.toString(16).padStart(8, '0');
  }

  function shortSlug(slug) {
    var clean = String(slug || '')
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'home';
    if (clean.length <= 44) return clean;
    return clean.slice(0, 35) + '_' + fnv1aHex8(clean);
  }

  function getKstDateString(offsetDays) {
    var offset = (typeof offsetDays === 'number' ? offsetDays : 0) * 86400000;
    var kstMs = Date.now() + (9 * 3600000) + offset;
    return new Date(kstMs).toISOString().slice(0, 10);
  }

  function detectPageInfo() {
    var path = (window.location.pathname || '/').replace(/\/+$/, '') || '/';
    var lower = path.toLowerCase();
    var postMatch = lower.match(/\/posts\/([^\/]+?)(?:\.html)?$/i);
    if (postMatch && postMatch[1]) {
      var name = postMatch[1].replace(/\.html$/i, '').replace(/^\/+|\/+$/g, '') || 'post';
      return { slug: name, isBlogArticle: name !== 'index' };
    }
    if (
      lower === '/' ||
      lower === '/index.html' ||
      /\/k-pantry(?:-scanner)?(?:\/index\.html)?$/i.test(lower)
    ) {
      return { slug: 'home', isBlogArticle: false };
    }
    var seg = lower.split('/').pop().replace(/\.html$/i, '') || 'home';
    return { slug: seg, isBlogArticle: false };
  }

  function shouldTrack(params) {
    if (params.get('force_track') === '1') return true;
    if (params.get('notrack') === '1') return false;
    if (params.get('admin') === '9616') return false;
    if (typeof navigator !== 'undefined' && navigator.webdriver) return false;
    var ua = (typeof navigator !== 'undefined' && navigator.userAgent) ? navigator.userAgent : '';
    if (/bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|pingdom|python|curl|wget|playwright|puppeteer/i.test(ua)) {
      return false;
    }
    var host = (window.location.hostname || '').toLowerCase();
    if (!host || host === 'localhost' || host === '127.0.0.1' || window.location.protocol === 'file:') {
      return false;
    }
    return true;
  }

  function hitKey(key) {
    try {
      fetch(API_BASE + '/hit/' + NAMESPACE + '/' + encodeURIComponent(key), {
        method: 'GET',
        mode: 'cors',
        keepalive: true,
        cache: 'no-store'
      }).catch(function () {});
    } catch (e) {}
  }

  function getKey(key) {
    return fetch(API_BASE + '/get/' + NAMESPACE + '/' + encodeURIComponent(key), {
      method: 'GET',
      mode: 'cors',
      cache: 'no-store'
    })
      .then(function (r) { return r.ok ? r.json() : { value: 0 }; })
      .then(function (d) { return (d && typeof d.value === 'number') ? d.value : 0; })
      .catch(function () { return 0; });
  }

  function mountAdminBar(info) {
    var today = getKstDateString(0);
    var yesterday = getKstDateString(-1);
    var sKey = shortSlug(info.slug);

    Promise.all([
      getKey('day__' + today + '__' + sKey),
      getKey('day__' + yesterday + '__' + sKey),
      getKey('total__' + sKey),
      getKey('day__' + today + '__all_site'),
      getKey('total__all_site')
    ]).then(function (vals) {
      var bar = document.createElement('div');
      bar.style.cssText = 'position:fixed;bottom:14px;right:14px;z-index:99999;background:#14532d;color:#fafaf7;padding:10px 14px;border-radius:10px;font-size:12px;font-family:system-ui,sans-serif;box-shadow:0 10px 25px rgba(0,0,0,0.35);border:1px solid #059669;';
      bar.innerHTML = '<strong>📊 K-Pantry Admin (' + sKey + ')</strong><br>' +
        'Today: <b>' + vals[0] + '</b> · Yesterday: <b>' + vals[1] + '</b> · Total: <b>' + vals[2] + '</b><br>' +
        'Site Today: <b>' + vals[3] + '</b> · Site Total: <b>' + vals[4] + '</b>';
      document.body.appendChild(bar);
    });
  }

  function init() {
    var params;
    try {
      params = new URLSearchParams(window.location.search || '');
    } catch (e) {
      params = { get: function () { return null; } };
    }
    var info = detectPageInfo();
    if (params.get('admin') === '9616') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { mountAdminBar(info); });
      } else {
        mountAdminBar(info);
      }
      return;
    }

    if (!shouldTrack(params)) return;

    var today = getKstDateString(0);
    var sKey = shortSlug(info.slug);

    var dedupeKey = 'kpantry_pv_' + today + '_' + sKey;
    if (params.get('force_track') !== '1') {
      try {
        var lastTs = parseInt(sessionStorage.getItem(dedupeKey) || '0', 10);
        if (lastTs && (Date.now() - lastTs) < 60000) return;
        sessionStorage.setItem(dedupeKey, String(Date.now()));
      } catch (e) {}
    }

    hitKey('day__' + today + '__' + sKey);
    hitKey('total__' + sKey);
    hitKey('day__' + today + '__all_site');
    hitKey('total__all_site');
  }

  window.KPantryTracker = {
    namespace: NAMESPACE,
    shortSlug: shortSlug,
    getKstDateString: getKstDateString
  };

  init();
})();
