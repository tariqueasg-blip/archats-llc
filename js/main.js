/* Archats LLC — interactions */

// Sticky nav shadow
const nav = document.getElementById('nav');
const onScroll = () => {
  nav.classList.toggle('scrolled', window.scrollY > 12);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile nav
const toggle = document.getElementById('navToggle');
const mobile = document.getElementById('navMobile');
toggle.addEventListener('click', () => {
  const open = mobile.classList.toggle('open');
  toggle.classList.toggle('open', open);
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
});
mobile.querySelectorAll('a').forEach((a) =>
  a.addEventListener('click', () => {
    mobile.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// Scroll reveal
const revealEls = document.querySelectorAll(
  '.service, .step, .review, .gallery__item, .areas__grid li, .about__media, .about__content, .section__head'
);
revealEls.forEach((el) => el.classList.add('reveal'));
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));
// Safety net: never leave content hidden if the observer fails to fire.
setTimeout(() => revealEls.forEach((el) => el.classList.add('in')), 3000);

// Chat widget logic lives in agent.js

// Estimate form → real lead delivery (FormSubmit relay → business inbox / Pop's phone)
(function () {
  const form = document.getElementById('estimateForm');
  if (!form) return;

  // The destination address is assembled at runtime so it never appears in the
  // source as a plain string for scrapers to harvest.
  const _e = [97,114,99,104,97,116,115,108,108,99,64,103,109,97,105,108,46,99,111,109];
  const ENDPOINT = 'https://formsubmit.co/ajax/' + String.fromCharCode.apply(null, _e);

  const btn = form.querySelector('button[type="submit"]');
  const formLoadedAt = Date.now();
  const MIN_FILL_MS = 3000;     // a real person takes longer than this
  const MAX_PER_DAY = 3;        // same browser, same day

  const digits = (v) => String(v || '').replace(/\D/g, '');
  const SPAM_WORDS = /\b(seo|backlinks?|guest post|crypto|bitcoin|forex|casino|loan|viagra|porn|escort|marketing services|web design services|rank your|increase your traffic|google ranking|bulk email|lead generation services)\b/i;
  const URLISH = /(https?:\/\/|www\.|\.com\b|\.net\b|\.ru\b|\.xyz\b|\[url|<\/?a\s)/i;

  function overDailyLimit() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = JSON.parse(localStorage.getItem('archatsLeadCount') || '{}');
      if (raw.day !== today) return false;
      return (raw.n || 0) >= MAX_PER_DAY;
    } catch (_) { return false; }
  }
  function bumpDailyLimit() {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const raw = JSON.parse(localStorage.getItem('archatsLeadCount') || '{}');
      const n = raw.day === today ? (raw.n || 0) + 1 : 1;
      localStorage.setItem('archatsLeadCount', JSON.stringify({ day: today, n }));
    } catch (_) {}
  }

  // Returns a short reason string when the submission should be dropped.
  function spamReason(fd) {
    const name = String(fd.get('name') || '').trim();
    const phone = digits(fd.get('phone'));
    const email = String(fd.get('email') || '').trim();
    const message = String(fd.get('message') || '').trim();
    const honey = form.querySelector('[name="_honey"]');

    if (honey && honey.value) return 'honey';
    if (Date.now() - formLoadedAt < MIN_FILL_MS) return 'too-fast';
    if (overDailyLimit()) return 'rate';

    if (name.length < 2 || name.length > 70) return 'name-length';
    if (/[<>{}\[\]\\@]/.test(name) || /\d{4,}/.test(name)) return 'name-shape';
    if (URLISH.test(name) || URLISH.test(message)) return 'url';

    if (phone.length < 10 || phone.length > 11) return 'phone-length';
    if (/^(\d)\1{6,}$/.test(phone)) return 'phone-repeat';
    if (/^(0123456789|1234567890|9876543210)/.test(phone)) return 'phone-sequence';

    if (email && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) return 'email-shape';

    if (SPAM_WORDS.test(message) || SPAM_WORDS.test(name)) return 'words';
    if (message.length > 4000) return 'message-length';

    return '';
  }

  const thanks = '<div style="text-align:center;padding:30px 10px;"><h3 style="color:var(--navy);margin:0 0 8px;">Request received!</h3><p style="color:#6b7280;margin:0;">Thanks — the family will reach out shortly, usually the same day.</p></div>';

  // Bots get the same success screen a human does, minus the email.
  const quietlySucceed = () => { form.innerHTML = thanks; };

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Remove any previous inline error before validating again.
    const oldErr = form.querySelector('.form__err');
    if (oldErr) oldErr.remove();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const fd = new FormData(form);
    if (spamReason(fd)) { quietlySucceed(); return; }

    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    const payload = {
      _subject: 'Quote request — ' + (fd.get('name') || ''),
      name: fd.get('name'),
      phone: fd.get('phone'),
      email: fd.get('email'),
      service: fd.get('service'),
      message: fd.get('message') || '',
      callback: '917-780-9790',
      source: window.Archats ? window.Archats.label() : '',
      _template: 'table',
    };

    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => r.json())
      .then(() => {
        bumpDailyLimit();
        if (window.Archats) window.Archats.track('generate_lead', { form: 'estimate', service: fd.get('service') || '' });
        form.innerHTML = thanks;
      })
      .catch(() => {
        if (btn) { btn.disabled = false; btn.textContent = 'Request Free Estimate'; }
        const err = document.createElement('p');
        err.className = 'form__err';
        err.style.cssText = 'margin:10px 0 0;font-size:13.5px;color:#b42318;';
        err.innerHTML = 'That didn\'t send. Call <a href="tel:+19177809790" style="color:inherit;text-decoration:underline">(917) 780-9790</a> and we\'ll take the details over the phone.';
        form.appendChild(err);
      });
  });
})();

// ---------- Scroll progress bar ----------
const progress = document.getElementById('progressBar');
const onProgress = () => {
  const h = document.documentElement;
  const max = h.scrollHeight - h.clientHeight;
  progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
};
window.addEventListener('scroll', onProgress, { passive: true });
window.addEventListener('resize', onProgress);
onProgress();

// ---------- Count-up stats ----------
const counters = document.querySelectorAll('[data-count]');
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (decimals ? (target * eased).toFixed(decimals) : Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    countIO.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach((c) => countIO.observe(c));

// ── Gallery video tiles: hover preview + tap-to-expand full playback ──
(function () {
  const $ = (id) => document.getElementById(id);
  const tiles = document.querySelectorAll('.gallery__item--video');
  function mVideo() { return $('galleryModalVideo'); }
  function modal() { return $('galleryModal'); }
  let active = null;

  function openModal(src) {
    const mv = mVideo(), md = modal();
    if (!mv || !md) return;
    mv.src = src;
    mv.muted = true; // never start with sound — nobody wants a scare
    const soundBtn = $('galleryModalSound');
    if (soundBtn) {
      soundBtn.classList.add('visible');
      setSoundUI(false);
    }
    md.classList.add('open');
    md.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mv.play().catch(function () {});
  }
  function setSoundUI(on) {
    const soundBtn = $('galleryModalSound');
    if (!soundBtn) return;
    soundBtn.dataset.on = on ? '1' : '0';
    const ico = on
      ? '<svg class="snd-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path></svg>'
      : '<svg class="snd-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>';
    soundBtn.innerHTML = ico + '<span class="snd-label">' + (on ? 'Sound on' : 'Tap for sound') + '</span>';
  }
  function toggleSound() {
    const mv = mVideo();
    if (!mv) return;
    mv.muted = !mv.muted;
    setSoundUI(!mv.muted);
  }
  function closeModal() {
    const mv = mVideo(), md = modal();
    if (!md) return;
    md.classList.remove('open');
    md.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (mv) { mv.pause(); mv.muted = true; mv.removeAttribute('src'); mv.load(); }
    const soundBtn = $('galleryModalSound');
    if (soundBtn) soundBtn.classList.remove('visible');
  }

  tiles.forEach(function (tile) {
    const v = tile.querySelector('.gallery__preview');
    // desktop hover = silent preview clip
    tile.addEventListener('mouseenter', function () {
      if (v && v.paused) { v.muted = true; v.play().catch(function () {}); }
    });
    tile.addEventListener('mouseleave', function () {
      if (v) { v.pause(); v.currentTime = 0; }
    });
    // tap / click = expand and play the full video with sound
    tile.addEventListener('click', function () {
      openModal(tile.dataset.video);
    });
  });

  // Event delegation: the modal markup sits AFTER these scripts in the DOM,
  // so direct lookups at load time would miss it. Delegate instead.
  document.addEventListener('click', function (e) {
    if (e.target.closest('#galleryModalSound')) { toggleSound(); return; }
    if (e.target.closest('[data-close-modal]')) closeModal();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
})();

// ── Dev editor gate — LOCAL ONLY ──
// Loads the PIN-gated image editor only from this machine (localhost / 127.0.0.1 / file://).
// Never active on the public site.
(function () {
  var local = location.hostname === 'localhost' || location.hostname === '127.0.0.1' || location.protocol === 'file:';
  if (local && new URLSearchParams(location.search).get('dev') === '1') {
    var s = document.createElement('script');
    s.src = 'js/dev-loader.js';
    document.head.appendChild(s);
  }
})();

// ── Contact hydration — tap-to-call / mail without a plaintext number in the HTML ──
// The phone + address are assembled at runtime (char codes) so naive scrapers/spiders
// can't harvest them straight from the page source. Deterrent, not a fortress.
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  ready(function () {
    var n = String.fromCharCode(57, 49, 55, 55, 56, 48, 57, 55, 57, 48); // digits
    var telText = '(' + n.slice(0, 3) + ') ' + n.slice(3, 6) + '-' + n.slice(6);
    var mail = ['archatsllc', 'gmail.com'].join(String.fromCharCode(64));
    document.querySelectorAll('[data-tel]').forEach(function (a) {
      a.setAttribute('href', 'tel:+1' + n);
      var s = a.querySelector('.teltext'); if (s) s.textContent = telText;
    });
    document.querySelectorAll('[data-mail]').forEach(function (a) {
      a.setAttribute('href', 'mail' + 'to:' + mail);
      var s = a.querySelector('.mailtext'); if (s) s.textContent = mail;
    });
  });
})();
