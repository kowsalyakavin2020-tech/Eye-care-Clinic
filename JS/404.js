/* ==========================================================================
   STACKLY — EYE CARE CLINIC
   404 page script · 404.js   (HTML/404.html)

   Three small jobs only:
     1. keep the no-scroll lock on a fixed stage
     2. make "Go Back" behave sensibly (real history, or home as a floor)
     3. reveal the entrance animation once the page is ready

   No GSAP, no ScrollTrigger, no Lenis: there is no shared shell here.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var win = window;
  var body = doc.body;

  var REDUCED = !!(win.matchMedia && win.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var HOME = '../index.html';

  /* ---------- 1 · keep the stage locked ---------- */
  function lockScroll() {
    if (win.scrollY !== 0 || win.scrollX !== 0) win.scrollTo(0, 0);
    doc.documentElement.style.overflow = 'hidden';
    doc.body.style.overflow = 'hidden';
  }

  var queued = false;
  function queueLock() {
    if (queued) return;
    queued = true;
    win.requestAnimationFrame(function () { queued = false; lockScroll(); });
  }

  win.addEventListener('scroll', queueLock, { passive: true });
  win.addEventListener('resize', queueLock);
  win.addEventListener('orientationchange', queueLock);
  win.addEventListener('pageshow', lockScroll);
  lockScroll();

  /* ---------- 2 · Go Back ----------
     Prefer real history. If there is nowhere to go back to, fall back
     home so a visitor is never stranded. */
  var backBtn = doc.getElementById('nfBack');

  function goBack() {
    if (backBtn) {
      backBtn.classList.add('is-busy');
      backBtn.disabled = true;
      win.setTimeout(function () {
        backBtn.classList.remove('is-busy');
        backBtn.disabled = false;
      }, 900);
    }

    var canGoBack = win.history.length > 1 && doc.referrer !== '';
    if (canGoBack) {
      win.history.back();
      /* if the browser never actually leaves, send them home */
      win.setTimeout(function () {
        if (!doc.hidden) win.location.href = HOME;
      }, 800);
      return;
    }
    win.location.href = HOME;
  }

  if (backBtn) backBtn.addEventListener('click', goBack);

  /* ---------- 3 · entrance reveal ---------- */
  function reveal() { body.classList.add('js-ready'); }

  if (REDUCED || doc.readyState === 'complete') {
    reveal();
  } else {
    win.addEventListener('load', reveal);
    doc.addEventListener('DOMContentLoaded', reveal);
  }

  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(lockScroll);
})();