/* Peratuso — Classic Trust pitch: header shadow, mobile menu, booking bar, tile details, form demo */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1024px)');

  /* Header shadow after 36px */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 36);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Hero slow zoom: pause control (WCAG 2.2.2), pauses off-screen and in hidden tabs */
  const hero = $('#hero');
  const toggle = $('.motion-toggle', hero);
  let userPaused = false, inView = true;
  const syncZoom = () => {
    hero.classList.toggle('is-paused', userPaused || !inView || document.hidden);
    hero.classList.toggle('is-paused-user', userPaused);
    toggle.setAttribute('aria-label', userPaused ? 'Bildbewegung fortsetzen' : 'Bildbewegung anhalten');
  };
  const syncToggle = () => { toggle.hidden = reduce.matches; };
  toggle.addEventListener('click', () => { userPaused = !userPaused; syncZoom(); });
  document.addEventListener('visibilitychange', syncZoom);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => { inView = en.isIntersecting; syncZoom(); }).observe(hero);
  }
  reduce.addEventListener('change', syncToggle);
  syncToggle(); syncZoom();

  /* Tile details: open on desktop, collapsed on mobile/tablet */
  const syncDetails = () => $$('.more').forEach(d => { d.open = desktop.matches; });
  syncDetails();
  desktop.addEventListener('change', syncDetails);

  /* Mobile menu with focus trap */
  const menu = $('#menu');
  const burger = $('.burger');
  const closeBtn = $('.menu__close');
  let lastFocus = null;
  const focusables = () => $$('a[href], button:not([disabled])', menu);
  const openMenu = () => {
    lastFocus = document.activeElement;
    menu.hidden = false;
    requestAnimationFrame(() => requestAnimationFrame(() => menu.classList.add('is-open')));
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    closeBtn.focus();
  };
  const closeMenu = (restore = true) => {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    const done = () => { menu.hidden = true; };
    reduce.matches ? done() : setTimeout(done, 240);
    if (restore && lastFocus) lastFocus.focus();
  };
  burger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', () => closeMenu());
  $$('a', menu).forEach(a => a.addEventListener('click', () => closeMenu(false)));
  menu.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenu(); return; }
    if (e.key !== 'Tab') return;
    const f = focusables(); const first = f[0]; const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  desktop.addEventListener('change', e => { if (e.matches && !menu.hidden) closeMenu(false); });

  /* Booking bar hides while #kontakt is in view */
  const bar = $('#bookbar');
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([en]) => bar.classList.toggle('is-hidden', en.isIntersecting), { threshold: 0.05 })
      .observe($('#kontakt'));
  }

  /* Tile links preselect the topic */
  const topic = $('#f-thema');
  $$('[data-topic]').forEach(a => a.addEventListener('click', () => { topic.value = a.dataset.topic; }));

  /* Form demo (does not submit) */
  const form = $('#contact-form');
  const errsum = $('#errsum');
  const required = $$('[required]', form);
  const isValid = el => el.type === 'checkbox' ? el.checked
    : el.type === 'email' ? /^\S+@\S+\.\S+$/.test(el.value.trim()) : el.value.trim() !== '';
  const mark = (el, ok) => {
    el.setAttribute('aria-invalid', ok ? 'false' : 'true');
    const err = document.getElementById(el.getAttribute('aria-describedby'));
    if (err) err.hidden = ok;
  };
  required.forEach(el => el.addEventListener(el.type === 'checkbox' ? 'change' : 'input', () => {
    if (el.getAttribute('aria-invalid') === 'true') mark(el, isValid(el));
  }));
  form.addEventListener('submit', e => {
    e.preventDefault();
    let firstBad = null;
    required.forEach(el => { const ok = isValid(el); mark(el, ok); if (!ok && !firstBad) firstBad = el; });
    if (firstBad) { errsum.hidden = false; errsum.focus(); return; }
    errsum.hidden = true;
    form.hidden = true;
    const s = $('#success'); s.hidden = false; s.focus();
  });
})();
