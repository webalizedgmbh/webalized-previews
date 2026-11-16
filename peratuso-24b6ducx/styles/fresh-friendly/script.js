/* Peratuso – fresh-friendly (Pitch): menu, tabs, form demo, calm motion */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');

  /* ---------- Header shadow on scroll ---------- */
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { menu.classList.add('is-open'); });
    } else {
      menu.classList.remove('is-open');
      setTimeout(function () { if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, reduce ? 0 : 200);
    }
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setMenu(false); toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) setMenu(false);
  });

  /* ---------- Tabs (ARIA, roving tabindex) ---------- */
  var tablist = document.querySelector('[role="tablist"]');
  var tabs = Array.prototype.slice.call(tablist.querySelectorAll('[role="tab"]'));
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });

  function activate(index, focus) {
    tabs.forEach(function (t, i) {
      var on = i === index;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      var p = panels[i];
      var wasHidden = p.hidden;
      p.hidden = !on;
      if (on && wasHidden && !reduce) {
        p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering');
        revealCards(p);
      }
    });
    if (focus) tabs[index].focus();
  }
  activate(0, false);

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(i, false); });
    tab.addEventListener('keydown', function (e) {
      var n = tabs.length, next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % n;
      else if (e.key === 'ArrowLeft') next = (i - 1 + n) % n;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = n - 1;
      if (next !== null) { e.preventDefault(); activate(next, true); }
    });
  });

  /* Deep links #treuhand / #immobilien activate the tab and scroll to the tabs */
  function handleDeepLink(hash, smooth) {
    var id = (hash || '').replace('#', '');
    var idx = panels.findIndex(function (p) { return p.id === id; });
    if (idx < 0) return false;
    activate(idx, false);
    tablist.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
    return true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a) return;
    if (handleDeepLink(a.getAttribute('href'), true)) {
      e.preventDefault();
      history.replaceState(null, '', a.getAttribute('href'));
    }
  });
  if (location.hash) handleDeepLink(location.hash, false);
  window.addEventListener('hashchange', function () { handleDeepLink(location.hash, true); });

  /* "Anfrage stellen" pre-selects the topic in the form */
  document.querySelectorAll('[data-topic]').forEach(function (a) {
    a.addEventListener('click', function () {
      var r = document.getElementById('t-' + a.getAttribute('data-topic'));
      if (r) r.checked = true;
    });
  });

  /* ---------- Active nav item ---------- */
  var navLinks = document.querySelectorAll('.nav-desktop a[data-nav]');
  function setActive(key) {
    navLinks.forEach(function (l) {
      var on = l.getAttribute('data-nav') === key;
      l.classList.toggle('is-active', on);
      if (on) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
    });
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      if (document.getElementById('leistungen').getBoundingClientRect().top < window.innerHeight / 2) setActive(t.getAttribute('aria-controls'));
    });
  });

  if ('IntersectionObserver' in window) {
    var sections = [
      { el: document.getElementById('leistungen'), key: function () { return tabs[0].getAttribute('aria-selected') === 'true' ? 'treuhand' : 'immobilien'; } },
      { el: document.getElementById('kontakt'), key: function () { return 'kontakt'; } }
    ];
    var spy = new IntersectionObserver(function () {
      var mid = window.innerHeight * 0.4, current = null;
      sections.forEach(function (s) {
        var r = s.el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) current = s.key();
      });
      setActive(current);
    }, { threshold: [0, .1, .25, .5, .75, 1] });
    sections.forEach(function (s) { spy.observe(s.el); });
    window.addEventListener('scroll', function () {
      var mid = window.innerHeight * 0.4, current = null;
      sections.forEach(function (s) {
        var r = s.el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) current = s.key();
      });
      setActive(current);
    }, { passive: true });

    /* Hide booking bar while #kontakt is in view */
    var bar = document.getElementById('booking-bar');
    new IntersectionObserver(function (entries) {
      bar.classList.toggle('is-hidden', entries[0].isIntersecting);
    }, { threshold: 0.05 }).observe(document.getElementById('kontakt'));
  }

  /* ---------- Reveal motion ---------- */
  var reveals = document.querySelectorAll('.reveal');
  function revealCards(scope) {
    if (reduce) return;
    var cards = scope.querySelectorAll('.card');
    cards.forEach(function (c, i) {
      c.classList.add('pre'); c.classList.remove('in');
      c.style.transitionDelay = (i * 60) + 'ms';
    });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        cards.forEach(function (c) { c.classList.add('in'); c.classList.remove('pre'); });
        setTimeout(function () { cards.forEach(function (c) { c.style.transitionDelay = ''; }); }, 400 + cards.length * 60);
      });
    });
  }
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    requestAnimationFrame(function () { reveals.forEach(function (el) { el.classList.add('is-visible'); }); });
    var firstPanel = panels[0];
    firstPanel.querySelectorAll('.card').forEach(function (c) { c.classList.add('pre'); });
    var cio = new IntersectionObserver(function (entries, obs) {
      if (entries[0].isIntersecting) { obs.disconnect(); revealCards(firstPanel); }
    }, { threshold: 0.1 });
    cio.observe(firstPanel);
  }

  /* ---------- Form demo (does not submit) ---------- */
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var summary = document.getElementById('form-error');
  var required = form.querySelectorAll('[required]');

  function validate(el) {
    var ok = el.type === 'checkbox' ? el.checked : el.value.trim() !== '' && el.checkValidity();
    var field = el.closest('.field');
    var err = document.getElementById('e-' + el.id.replace('f-', ''));
    field.classList.toggle('has-error', !ok);
    el.setAttribute('aria-invalid', String(!ok));
    if (err) err.hidden = ok;
    return ok;
  }
  required.forEach(function (el) {
    el.addEventListener(el.type === 'checkbox' ? 'change' : 'blur', function () {
      if (el.getAttribute('aria-invalid') !== null || el.value) validate(el);
    });
    el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') validate(el); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var firstInvalid = null;
    required.forEach(function (el) { if (!validate(el) && !firstInvalid) firstInvalid = el; });
    if (firstInvalid) { summary.hidden = false; firstInvalid.focus(); return; }
    summary.hidden = true;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
})();
