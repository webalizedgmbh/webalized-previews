/* Peratuso pitch page: accessible tabs + desktop/mobile preview viewer */
(function () {
  'use strict';

  var DESKTOP_W = 1280;   // virtual desktop viewport width
  var MOBILE_W = 390;     // virtual phone viewport width
  var smallScreen = window.matchMedia('(max-width: 720px)');
  var mode = smallScreen.matches ? 'mobile' : 'desktop';

  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"]'));
  var viewers = Array.prototype.slice.call(document.querySelectorAll('.viewer'));

  /* ---------- Viewer ---------- */
  function layout(viewer) {
    var stage = viewer.querySelector('.stage');
    var frame = viewer.querySelector('.frame');
    var iframe = viewer.querySelector('iframe');
    var avail = stage.clientWidth;
    if (!avail) return; // hidden panel

    var stageH = smallScreen.matches
      ? Math.round(window.innerHeight * 0.78)
      : Math.max(480, Math.min(window.innerHeight * 0.78, 860));
    stage.style.height = stageH + 'px';

    var scale, frameW, frameH;
    if (mode === 'desktop') {
      scale = Math.min(1, avail / DESKTOP_W);
      frameW = avail;
      frameH = stageH;
      iframe.style.width = (avail / scale) + 'px';
    } else {
      var padY = smallScreen.matches ? 40 : 48;
      // leave room for the 10px phone bezel on both sides
      scale = Math.min(1, (avail - 36) / MOBILE_W);
      frameW = MOBILE_W * scale;
      frameH = stageH - padY;
      iframe.style.width = MOBILE_W + 'px';
    }
    frame.style.width = frameW + 'px';
    frame.style.height = frameH + 'px';
    iframe.style.height = (frameH / scale) + 'px';
    iframe.style.transform = scale < 1 ? 'scale(' + scale + ')' : 'none';
  }

  function setMode(next) {
    mode = next;
    viewers.forEach(function (v) {
      v.setAttribute('data-mode', mode);
      v.querySelectorAll('.seg__btn').forEach(function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode));
      });
      layout(v);
    });
  }

  viewers.forEach(function (v) {
    v.querySelectorAll('.seg__btn').forEach(function (b) {
      b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); });
    });
  });

  /* ---------- Tabs (WAI-ARIA, automatic activation) ---------- */
  function activate(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    if (focus) tab.focus();
    var panel = document.getElementById(tab.getAttribute('aria-controls'));
    layout(panel.querySelector('.viewer'));
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { activate(tab, false); });
    tab.addEventListener('keydown', function (e) {
      var n = tabs.length, j = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
      else if (e.key === 'Home') j = 0;
      else if (e.key === 'End') j = n - 1;
      if (j !== null) { e.preventDefault(); activate(tabs[j], true); }
    });
  });

  /* ---------- Init + resize ---------- */
  setMode(mode);
  var raf;
  window.addEventListener('resize', function () {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(function () { viewers.forEach(layout); });
  });
})();
