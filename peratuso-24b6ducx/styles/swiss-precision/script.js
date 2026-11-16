/* Peratuso pitch · swiss-precision: menu, header state, nav highlight, motion, form demo */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* Motion (only added by JS, so no-JS shows everything) */
  if (!reduce && hasIO) {
    doc.classList.add('js-motion');
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.querySelectorAll('.fade').forEach(function (el) { el.classList.add('is-in'); });
      });
    });
    var drawIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-drawn'); drawIO.unobserve(e.target); }
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.section').forEach(function (s) { drawIO.observe(s); });
  }

  /* Header border after 8px scroll */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  var closeBtn = menu.querySelector('.menu-close');
  function openMenu() {
    menu.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(function () { menu.classList.add('is-open'); });
    closeBtn.focus();
  }
  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menu.hidden = true;
    if (returnFocus) toggle.focus();
  }
  toggle.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', function () { closeMenu(true); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) closeMenu(true);
  });

  /* Active nav item */
  if (hasIO) {
    var links = {};
    document.querySelectorAll('.site-nav a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var navIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        Object.keys(links).forEach(function (k) { links[k].removeAttribute('aria-current'); });
        if (links[e.target.id]) links[e.target.id].setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    ['treuhand', 'immobilien', 'ueber-uns', 'kontakt'].forEach(function (id) {
      var el = document.getElementById(id); if (el) navIO.observe(el);
    });

    /* Hide booking bar while contact is visible */
    var bar = document.getElementById('book-bar');
    var contactIO = new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.05 });
    contactIO.observe(document.getElementById('kontakt'));
  }

  /* "Anfrage stellen" preselects the topic */
  document.querySelectorAll('[data-topic]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.querySelector('input[name="thema"][value="' + a.getAttribute('data-topic') + '"]');
      if (r) r.checked = true;
    });
  });

  /* Form demo: validates, never submits */
  var form = document.getElementById('contact-form');
  var errorBox = document.getElementById('form-error');
  var success = document.getElementById('form-success');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    form.querySelectorAll('[required]').forEach(function (f) {
      var ok = f.type === 'checkbox' ? f.checked : f.value.trim() !== '' && f.checkValidity();
      if (ok) { f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); }
      else {
        f.setAttribute('aria-invalid', 'true');
        f.setAttribute('aria-describedby', 'form-error');
        if (!firstInvalid) firstInvalid = f;
      }
    });
    if (firstInvalid) { errorBox.hidden = false; firstInvalid.focus(); return; }
    errorBox.hidden = true;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
  form.addEventListener('input', function (e) {
    var f = e.target;
    if (f.getAttribute('aria-invalid') === 'true') {
      var ok = f.type === 'checkbox' ? f.checked : f.value.trim() !== '' && f.checkValidity();
      if (ok) { f.removeAttribute('aria-invalid'); f.removeAttribute('aria-describedby'); }
    }
  });
})();
