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

// Estimate form (placeholder success state)
const form = document.getElementById('estimateForm');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Request Sent ✓';
  btn.style.background = '#22c55e';
  form.reset();
  setTimeout(() => {
    btn.textContent = 'Request Free Estimate';
    btn.style.background = '';
  }, 3200);
});

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

// ---------- Mobile preview ----------
const deviceModal = document.getElementById('deviceModal');
const deviceToggle = document.getElementById('deviceToggle');
const openDevice = (open) => {
  deviceModal.classList.toggle('open', open);
  deviceModal.setAttribute('aria-hidden', String(!open));
};
deviceToggle.addEventListener('click', () => openDevice(true));
document.getElementById('deviceClose').addEventListener('click', () => openDevice(false));
document.getElementById('deviceBackdrop').addEventListener('click', () => openDevice(false));

// Hide dev toolbar inside the mobile preview iframe (keep editor.js intact)
if (new URLSearchParams(location.search).has('preview')) {
  document.body.classList.add('preview-mode');
}

// ── Gallery video tiles: hover preview + tap-to-expand full playback ──
(function () {
  const modal = document.getElementById('galleryModal');
  const mVideo = document.getElementById('galleryModalVideo');
  const tiles = document.querySelectorAll('.gallery__item--video');
  let active = null;

  function openModal(src) {
    mVideo.src = src;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    mVideo.play().catch(function () {});
  }
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    mVideo.pause();
    mVideo.removeAttribute('src');
    mVideo.load();
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

  document.querySelectorAll('[data-close-modal]').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
})();
