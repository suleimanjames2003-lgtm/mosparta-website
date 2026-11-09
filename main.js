/* Mosparta Digital Hub site script.
   META PIXEL: paste your Pixel ID between the quotes below (numbers only), e.g. '123456789012345'.
   Leave it empty and nothing loads. */
var PIXEL_ID = '';

(function () {
  var d = document, html = d.documentElement;
  html.classList.remove('no-js');

  /* ---------- Meta Pixel (loads only when PIXEL_ID is set) ---------- */
  if (PIXEL_ID) {
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,d,'script','https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', PIXEL_ID); fbq('track', 'PageView');
  }

  /* ---------- tracking helper: Pixel + dataLayer (GA4/GTM ready) ---------- */
  window.dataLayer = window.dataLayer || [];
  function track(name, params) {
    params = params || {};
    params.page = location.pathname; params.lang = html.lang;
    try {
      if (window.fbq) {
        if (name === 'Lead') fbq('track', 'Lead', params);
        else {
          fbq('trackCustom', name, params);
          if (name !== 'InstagramClick') fbq('track', 'Contact', params);
        }
      }
    } catch (e) {}
    window.dataLayer.push(Object.assign({ event: 'mosparta_' + name.toLowerCase() }, params));
  }

  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href');
    if (h.indexOf('https://wa.me') === 0) track('WhatsAppClick', { where: a.dataset.where || 'link' });
    else if (h.indexOf('tel:') === 0) track('CallClick', { number: h.slice(4), where: a.dataset.where || 'link' });
    else if (h.indexOf('mailto:') === 0) track('EmailClick', { where: a.dataset.where || 'link' });
    else if (h.indexOf('instagram.com') > -1) track('InstagramClick', {});
  });

  /* ---------- language memory ---------- */
  var KEY = 'mosparta_lang';
  d.querySelectorAll('[data-setlang]').forEach(function (a) {
    a.addEventListener('click', function () { try { localStorage.setItem(KEY, a.dataset.setlang); } catch (e) {} });
  });
  try {
    var saved = localStorage.getItem(KEY), alt = d.querySelector('[data-setlang]:not(.on)');
    var internal = d.referrer && d.referrer.indexOf(location.host) > -1;
    if (saved && saved !== html.lang && alt && !internal) location.replace(alt.href);
  } catch (e) {}

  /* ---------- forms: answers go to WhatsApp ---------- */
  var WA = '255622050743';
  d.querySelectorAll('form[data-wa]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var group = f.querySelectorAll('[data-oneof]');
      if (group.length && ![].some.call(group, function (x) { return x.value.trim(); })) {
        group[0].setCustomValidity(group[0].dataset.oneof); group[0].reportValidity();
        group[0].addEventListener('input', function c() { group[0].setCustomValidity(''); group[0].removeEventListener('input', c); });
        return;
      }
      var lines = [f.dataset.intro, ''];
      var seen = {};
      f.querySelectorAll('[data-q]').forEach(function (el) {
        var q = el.dataset.q, v = '';
        if (seen[q]) return;
        if (el.type === 'checkbox' || el.type === 'radio') {
          var picked = [].map.call(f.querySelectorAll('[data-q="' + q + '"]:checked'), function (x) { return x.value; });
          seen[q] = 1; v = picked.join(', ');
        } else v = (el.value || '').trim();
        if (v) lines.push('*' + q.replace(/[?:]\s*$/, '') + ':* ' + v);
      });
      lines.push('', '[Web: ' + f.dataset.wa + ']');
      track('Lead', { content_name: f.dataset.wa });
      var url = 'https://wa.me/' + WA + '?text=' + encodeURIComponent(lines.join('\n'));
      var w = window.open(url, '_blank', 'noopener');
      if (!w) location.href = url;
    });
  });

  /* ---------- mobile menu ---------- */
  var burger = d.querySelector('.burger'), mnav = d.querySelector('.mnav');
  if (burger && mnav) burger.addEventListener('click', function () {
    var open = mnav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
    d.body.style.overflow = open ? 'hidden' : '';
  });

  /* ---------- reveal + counters ---------- */
  function count(el) {
    var end = parseFloat(el.dataset.n), dec = (el.dataset.n.split('.')[1] || '').length, suf = el.dataset.s || '', t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1400, 1), v = end * (1 - Math.pow(1 - p, 3));
      el.textContent = v.toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) {
        if (!x.isIntersecting) return;
        x.target.classList.add('in');
        x.target.querySelectorAll('[data-n]').forEach(count);
        io.unobserve(x.target);
      });
    }, { threshold: .15 });
    d.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else d.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });

  /* ---------- card glow ---------- */
  d.querySelectorAll('.card').forEach(function (c) {
    c.addEventListener('pointermove', function (e) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  var y = d.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();
})();
