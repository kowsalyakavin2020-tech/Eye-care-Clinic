/* ==========================================================================
   STACKLY — EYE CARE CLINIC
   Technology Page behaviour  ·  technology.js  (rebuilt)
   --------------------------------------------------------------------------
   Loaded AFTER home.js. Drives the ten original technology sections only.
   Every block is guarded, so a missing section is a harmless no-op.
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  /* wait for the shared preloader to finish --------------------------------- */
  function afterPreloader(fn) {
    var pl = $('#preloader');
    if (!pl) { setTimeout(fn, 180); return; }
    var fired = false;
    function fire() { if (fired) return; fired = true; fn(); }
    if (pl.style.display === 'none') { fire(); return; }
    if ('MutationObserver' in window) {
      var mo = new MutationObserver(function () {
        if (pl.style.display === 'none' || getComputedStyle(pl).display === 'none') {
          mo.disconnect(); fire();
        }
      });
      mo.observe(pl, { attributes: true, attributeFilter: ['style', 'class'] });
    }
    setTimeout(fire, reduced ? 700 : 3000);
  }

  ready(function () {

    var startOK = hasGSAP && hasST && !reduced;

    /* ================================================================
       01 · HERO
       ================================================================ */
    var hero = $('#tchHero');
    if (hero) {
      var lines = $$('.tch-hero__title .line > span', hero);

      if (startOK) {
        gsap.set(lines, { yPercent: 112 });
        gsap.set('.tch-hero__kicker, .tch-hero__sub, .tch-hero__cta > *, .tch-hero__tape li, .tch-hero__tag', { opacity: 0, y: 18 });
        gsap.set('.tch-hero__badge', { scale: .4, opacity: 0 });
        gsap.set('.tch-hero__frame', { clipPath: 'polygon(48% 0, 52% 0, 52% 100%, 48% 100%)' });
      }

      afterPreloader(function () {
        if (!startOK) return;
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .fromTo(lines, { yPercent: 112 }, { yPercent: 0, duration: 1.1, stagger: .12 }, 0)
          .fromTo('.tch-hero__frame', { clipPath: 'polygon(48% 0, 52% 0, 52% 100%, 48% 100%)' },
            { clipPath: 'polygon(13% 0, 100% 0, 87% 100%, 0 100%)', duration: 1.4, ease: 'expo.inOut' }, .1)
          .fromTo('.tch-hero__kicker', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7 }, 0)
          .fromTo('.tch-hero__badge', { scale: .4, opacity: 0 }, { scale: 1, opacity: 1, duration: .9, ease: 'back.out(1.5)' }, .5)
          .fromTo('.tch-hero__sub', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .8 }, .4)
          .fromTo('.tch-hero__cta > *', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .7, stagger: .1 }, .52)
          .fromTo('.tch-hero__tape li', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .7, stagger: .09 }, .62)
          .fromTo('.tch-hero__tag', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7 }, .7);
      });

      /* rotating word (fade + blur swap) */
      var rot = $('.tch-hero__rot span', hero) || $('.tch-hero__rot', hero);
      if (rot && !reduced && hasGSAP) {
        var reel = ['sees', 'measures', 'predicts', 'protects'];
        var ri = 0;
        setTimeout(function () {
          setInterval(function () {
            ri = (ri + 1) % reel.length;
            gsap.timeline()
              .to(rot, { opacity: 0, filter: 'blur(6px)', duration: .3, ease: 'power2.in' })
              .add(function () { rot.textContent = reel[ri]; })
              .to(rot, { opacity: 1, filter: 'blur(0px)', duration: .4, ease: 'power2.out' });
          }, 2600);
        }, 2200);
      }

      /* pointer parallax + glow follow */
      var stage = $('.tch-hero__stage', hero);
      var glow = $('.tch-hero__glow', hero);
      if (stage && !isTouch && startOK) {
        hero.addEventListener('pointermove', function (e) {
          var sr = stage.getBoundingClientRect();
          var mx = (e.clientX - sr.left) / sr.width - .5;
          var my = (e.clientY - sr.top) / sr.height - .5;
          gsap.to('.tch-hero__frame img', { x: mx * 26, y: my * 26, duration: .8, ease: 'power3.out' });
          if (glow) {
            glow.style.left = (e.clientX - sr.left) + 'px';
            glow.style.top = (e.clientY - sr.top) + 'px';
            glow.style.transform = 'translate(-50%, -50%)';
          }
        });
        stage.addEventListener('pointerleave', function () {
          if (!glow) return;
          glow.style.left = '50%'; glow.style.top = '50%';
        });
      }

      if (startOK) {
        gsap.to('.tch-hero__frame', {
          yPercent: -8, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
        gsap.to('.tch-hero__copy', {
          opacity: .35, yPercent: 6, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
      }
    }

    /* ================================================================
       02 · SWITCH  (row list drives a large colour image)
       ================================================================ */
    var sw = $('#tchSwitch');
    if (sw) {
      var rows = $$('.tch-switch__row', sw);
      var swImgs = $$('.tch-switch__img', sw);
      var setRow = function (i) {
        rows.forEach(function (r, k) { r.classList.toggle('is-on', k === i); });
        swImgs.forEach(function (m, k) { m.classList.toggle('is-on', k === i); });
      };
      rows.forEach(function (r, i) {
        r.addEventListener('mouseenter', function () { setRow(i); });
        r.addEventListener('focus', function () { setRow(i); });
        r.addEventListener('click', function () { setRow(i); });
      });
      if (rows.length) setRow(0);

      $$('.tch-switch__body em', sw).forEach(function (cap) {
        cap.addEventListener('click', function (e) {
          e.stopPropagation();
          window.location.href = '404.html';
        });
      });

      if (startOK) {
        gsap.from('.tch-switch__stage', {
          opacity: 0, x: -44, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: sw, start: 'top 78%', once: true }
        });
        gsap.from(rows, {
          opacity: 0, x: 34, duration: .7, stagger: .1, ease: 'expo.out',
          scrollTrigger: { trigger: sw, start: 'top 78%', once: true }
        });
      }
    }

    /* ================================================================
       03 · ATLAS  (hotspot pins open glass annotations)
       ================================================================ */
    var atlas = $('#tchAtlas');
    if (atlas) {
var pins = $$('.tch-atlas__pin', atlas);
      var cards = $$('.tch-atlas__card', atlas);
      function setPin(i){
        pins.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
        cards.forEach(function (c, k) { c.classList.toggle('is-on', k === i); });
      }
      pins.forEach(function (p, i) {
        p.addEventListener('mouseenter', function () { setPin(i); });
        p.addEventListener('click', function () { setPin(i); });
        p.addEventListener('focus', function () { setPin(i); });
      });
      if (pins.length) setPin(0);

      if (startOK) {
        gsap.from('.tch-atlas__stage', {
          opacity: 0, y: 36, duration: .9, ease: 'expo.out',
          scrollTrigger: { trigger: atlas, start: 'top 80%', once: true }
        });
        gsap.from(pins, {
          opacity: 0, y: 16, duration: .6, stagger: .1, ease: 'back.out(1.6)', clearProps: 'transform',
          scrollTrigger: { trigger: atlas, start: 'top 72%', once: true }
        });
      }
    }

    /* ================================================================
       04 · PATH  (SVG route draws, image nodes pop in)
       ================================================================ */
    var path = $('#tchPath');
    if (path) {
      if (!startOK) $$('.tch-path__node', path).forEach(function (n) { n.classList.add('tch-path__noanim'); });
      var svg = $('.tch-path__svg', path);
      var svgVisible = svg && getComputedStyle(svg).display !== 'none';
      if (svgVisible && startOK) {
        var line = $('.tch-path__line', path);
        if (line) {
          gsap.fromTo(line, { strokeDashoffset: 1 }, {
            strokeDashoffset: 0, ease: 'none',
            scrollTrigger: { trigger: path, start: 'top 72%', end: 'bottom 78%', scrub: true }
          });
        }
        var pnodes = $$('.tch-path__node', path);
        gsap.fromTo(pnodes, { opacity: 0, scale: .7, x: 0, y: 20, xPercent: -50, yPercent: -50 },
          {
            opacity: 1, scale: 1, x: 0, y: 0, xPercent: -50, yPercent: -50, duration: .7, stagger: .16, ease: 'back.out(1.4)',
            scrollTrigger: { trigger: path, start: 'top 62%', once: true }
          });
      }
    }

    /* ================================================================
       05 · SPEC  (meters fill, rows highlight)
       ================================================================ */
    var spec = $('#tchSpec');
    if (spec && startOK) {
      gsap.from('.tch-spec__media', {
        opacity: 0, x: -44, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: spec, start: 'top 78%', once: true }
      });
      $$('.tch-spec__bar i', spec).forEach(function (bar, i) {
        gsap.to(bar, {
          scaleX: 1, duration: 1.1, delay: i * .08, ease: 'power3.out',
          scrollTrigger: { trigger: bar, start: 'top 90%', once: true }
        });
      });
      gsap.from('.tch-spec__row', {
        opacity: 0, y: 20, duration: .6, stagger: .08, ease: 'expo.out',
        scrollTrigger: { trigger: spec, start: 'top 78%', once: true }
      });
    }

    /* ================================================================
       06 · WIPE  (scroll scrubs one image away)
       ================================================================ */
    var wipe = $('#tchWipe');
    if (wipe && startOK) {
      var topImg = $('.tch-wipe__img--top', wipe);
      var divider = $('.tch-wipe__divider', wipe);
      if (topImg && divider) {
        gsap.timeline({
          scrollTrigger: { trigger: wipe, start: 'top top', end: '+=110%', scrub: true, pin: true, anticipatePin: 1 }
        })
          .fromTo(topImg, { clipPath: 'inset(0 0 0 0)' },
            { clipPath: 'inset(0 0 0 100%)', ease: 'none' }, 0)
          .fromTo(divider, { left: '0%' }, { left: '100%', ease: 'none' }, 0);
      }
    }

    /* ================================================================
       07 · WALL  (tilted tiles rise, captions wipe up)
       ================================================================ */
    var wall = $('#tchWall');
    if (wall && startOK) {
      gsap.from('.tch-wall__item', {
        opacity: 0, y: 50, duration: .8, stagger: .08, ease: 'expo.out', clearProps: 'transform',
        scrollTrigger: { trigger: wall, start: 'top 76%', once: true }
      });
      gsap.to('.tch-wall__grid', {
        yPercent: -4, ease: 'none',
        scrollTrigger: { trigger: wall, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    /* ================================================================
       08 · BAND  (panning statement + parallax minis)
       ================================================================ */
    var band = $('#tchBand');
    if (band && startOK) {
      gsap.from('.tch-band__eyebrow', {
        opacity: 0, y: 16, duration: .7, ease: 'expo.out',
        scrollTrigger: { trigger: band, start: 'top 74%', once: true }
      });
      gsap.fromTo('.tch-band__title', { opacity: .3, y: 32 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: band, start: 'top 74%', once: true }
      });
      gsap.to('.tch-band__title', {
        xPercent: -10, ease: 'none',
        scrollTrigger: { trigger: band, start: 'center center', end: 'bottom top', scrub: true }
      });
      gsap.to('.tch-band__mini--a', {
        yPercent: -16, ease: 'none',
        scrollTrigger: { trigger: band, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    /* ================================================================
       09 · DECK  (instrument cards fan out on scroll)
       ================================================================ */
    var deck = $('#tchDeck');
    if (deck && startOK) {
      var deckCards = $$('.tch-deck__card', deck);
      var positions = [
        { r: '-14deg', x: '-235px' },
        { r: '0deg', x: '0px' },
        { r: '14deg', x: '235px' }
      ];
      var wideDeck = window.matchMedia('(min-width: 901px)').matches;
      if (wideDeck) {
        deckCards.forEach(function (c, i) {
          var p = positions[i] || positions[positions.length - 1];
          gsap.set(c, { '--r': '0deg', '--x': '0px' });
          gsap.to(c, {
            '--r': p.r, '--x': p.x, duration: 1.1, delay: i * .12, ease: 'expo.out',
            scrollTrigger: { trigger: deck, start: 'top 68%', once: true }
          });
        });
      }
    }

    /* ================================================================
       10 · OUTRO  (typewriter status + reveal)
       ================================================================ */
    var outro = $('#tchOutro');
    if (outro) {
      if (startOK) {
        gsap.from('.tch-outro__copy > *', {
          opacity: 0, y: 26, duration: .8, stagger: .1, ease: 'expo.out',
          scrollTrigger: { trigger: outro, start: 'top 74%', once: true }
        });
        gsap.from('.tch-outro__media', {
          opacity: 0, x: 44, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: outro, start: 'top 76%', once: true }
        });
        gsap.to('.tch-outro__media img', {
          yPercent: -6, ease: 'none',
          scrollTrigger: { trigger: outro, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }

      var status = $('.tch-outro__status', outro);
      if (status && !reduced) {
        var phrases = ['Booking opens in three taps', 'Same-week appointments', '38 clinics · 22 countries'];
        var pi = 0, ci = 0, forward = true;
        var type = function () {
          var p = phrases[pi];
          status.textContent = p.slice(0, ci);
          if (forward) {
            if (ci < p.length) { ci++; setTimeout(type, 65); }
            else { forward = false; setTimeout(type, 1700); }
          } else {
            if (ci > 0) { ci--; setTimeout(type, 32); }
            else { forward = true; pi = (pi + 1) % phrases.length; setTimeout(type, 320); }
          }
        };
        type();
      }
    }

    /* refresh once everything (fonts / images) has settled */
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); });

  });
})();