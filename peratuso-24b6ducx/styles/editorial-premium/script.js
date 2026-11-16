/* Peratuso pitch — Editorial Premium: header state, mobile menu, booking bar, reveals, form demo */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Header shrink after 24px */
  var hdr = document.querySelector('.hdr');
  function onScroll() { hdr.classList.toggle('is-scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Hero slow zoom: pause control (WCAG 2.2.2), pauses off-screen and in hidden tabs */
  var hero = document.getElementById('hero');
  var toggle = hero.querySelector('.motion-toggle');
  var userPaused = false, inView = true;
  function syncZoom() {
    hero.classList.toggle('is-paused', userPaused || !inView || document.hidden);
    hero.classList.toggle('is-paused-user', userPaused);
    toggle.setAttribute('aria-label', userPaused ? 'Bildbewegung fortsetzen' : 'Bildbewegung anhalten');
  }
  toggle.hidden = reduce;
  toggle.addEventListener('click', function () { userPaused = !userPaused; syncZoom(); });
  document.addEventListener('visibilitychange', syncZoom);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { inView = en[0].isIntersecting; syncZoom(); })
      .observe(hero.querySelector('.hero__band'));
  }
  syncZoom();

  /* Mobile menu */
  var burger = document.querySelector('.burger');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) {
      menu.hidden = false;
      hdr.classList.add('is-scrolled');
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
      menu.querySelector('a').focus();
    } else {
      menu.classList.remove('is-open');
      setTimeout(function () { if (burger.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, reduce ? 0 : 300);
      onScroll();
    }
  }
  burger.addEventListener('click', function () { setMenu(burger.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a[href^="#"]')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') { setMenu(false); burger.focus(); }
  });

  /* Topic preselect from «Anfrage stellen» */
  document.querySelectorAll('[data-topic]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.querySelector('input[name="thema"][value="' + a.dataset.topic + '"]');
      if (r) r.checked = true;
    });
  });

  if ('IntersectionObserver' in window) {
    /* Booking bar hides while #kontakt is visible */
    var bar = document.getElementById('bookbar');
    new IntersectionObserver(function (en) {
      bar.classList.toggle('is-hidden', en[0].isIntersecting);
    }, { threshold: 0.05 }).observe(document.getElementById('kontakt'));

    /* Reveals, once; entries stagger 80ms within a group */
    document.querySelectorAll('.entries').forEach(function (g) {
      g.querySelectorAll('.entry').forEach(function (el, i) { el.style.setProperty('--d', (i * 80) + 'ms'); });
    });
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.2 });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-in'); });
  }

  /* Textarea auto-grow */
  var ta = document.getElementById('f-msg');
  ta.addEventListener('input', function () { ta.style.height = 'auto'; ta.style.height = ta.scrollHeight + 2 + 'px'; });

  /* Form demo: validate, never submit */
  var form = document.getElementById('contact-form');
  var errBox = document.getElementById('form-error');
  var ok = document.getElementById('form-success');
  function mark(el, bad) {
    var wrap = el.closest('.field') || el.closest('.choice');
    wrap.classList.toggle('is-invalid', bad);
    el.setAttribute('aria-invalid', bad ? 'true' : 'false');
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var first = null;
    form.querySelectorAll('[required]').forEach(function (el) {
      var bad = el.type === 'checkbox' ? !el.checked : !el.value.trim() || (el.type === 'email' && !el.checkValidity());
      mark(el, bad);
      if (bad && !first) first = el;
    });
    if (first) { errBox.hidden = false; first.focus(); return; }
    errBox.hidden = true;
    form.hidden = true;
    ok.hidden = false;
    ok.focus();
  });
  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') mark(e.target, false);
  });
})();
