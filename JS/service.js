/* ==========================================================================
   STACKLY — EYE CARE CLINIC
   Service Page behaviour  ·  service.js
   --------------------------------------------------------------------------
   Loaded AFTER home.js, so the shared infrastructure (preloader, Lenis,
   cursor, header, drawer, marquee, footer) is already running. This file
   only drives the ten service-page sections. Everything is guarded, so a
   missing section is a harmless no-op.
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

  /* wait for the shared preloader to finish before the hero opens up -------- */
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

    /* ================================================================
       S1 · HERO — IRIS APERTURE
       ================================================================ */
    var hero = $('#svcHero');
    if (hero) {
      /* hold the hero in its start state behind the preloader (no flash) */
      if ((hasGSAP && hasST) && !reduced) {
        gsap.set('.shero__iris', { clipPath: 'circle(11% at 50% 50%)' });
        gsap.set('.shero__ring', { scale: .55, opacity: 0 });
        gsap.set('.shero__line > span', { yPercent: 116, rotate: 3 });
        gsap.set('.shero__kicker, .shero__sub, .shero__cta > *, .shero__meta li, .shero__chip', { opacity: 0 });
      }

      afterPreloader(function () {
        var iris = $('.shero__iris', hero);
        if (!(hasGSAP && hasST) || reduced) {
          if (iris) iris.style.clipPath = 'circle(78% at 50% 50%)';
          return;
        }
        gsap.timeline({ defaults: { ease: 'expo.out' } })
          .fromTo(iris, { clipPath: 'circle(11% at 50% 50%)' },
            { clipPath: 'circle(78% at 50% 50%)', duration: 1.5, ease: 'expo.inOut' }, 0)
          .fromTo('.shero__ring', { scale: .55, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.4 }, 0)
          .fromTo('.shero__kicker', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, .1)
          .fromTo('.shero__line > span', { yPercent: 116, rotate: 3 },
            { yPercent: 0, rotate: 0, duration: 1.2, stagger: .1 }, .16)
          .fromTo('.shero__sub', { y: 24, opacity: 0 }, { y: 0, opacity: 1, duration: .9 }, .56)
          .fromTo('.shero__cta > *', { y: 26, opacity: 0 },
            { y: 0, opacity: 1, duration: .8, stagger: .1 }, .7)
          .fromTo('.shero__meta li', { y: 22, opacity: 0 },
            { y: 0, opacity: 1, duration: .8, stagger: .09 }, .8)
          .fromTo('.shero__chip', { scale: .6, opacity: 0 },
            { scale: 1, opacity: 1, duration: .8, ease: 'back.out(1.6)', stagger: .12 }, .6);
      });

      if (!isTouch) {
        var deck = $('.shero__deck', hero);
        if (deck) {
          deck.addEventListener('mousemove', function (e) {
            var r = deck.getBoundingClientRect();
            deck.style.setProperty('--px', ((e.clientX - r.left) / r.width - .5).toFixed(3));
            deck.style.setProperty('--py', ((e.clientY - r.top) / r.height - .5).toFixed(3));
          });
          deck.addEventListener('mouseleave', function () {
            deck.style.setProperty('--px', 0);
            deck.style.setProperty('--py', 0);
          });
        }
      }

      if (hasST && !reduced) {
        gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } })
          .to('.shero__bg img', { yPercent: 16, scale: 1.24 }, 0)
          .to('.shero__copy', { y: -70, opacity: .16 }, 0)
          .to('.shero__deck', { y: -60 }, 0);
      }
    }

    /* ================================================================
       S2 · SERVICE INDEX — CURSOR LENS
       ================================================================ */
    var sindex = $('#svcIndex');
    if (sindex) {
      var lens = $('.sindex__lens', sindex);
      var lensImg = lens ? $('img', lens) : null;
      var lensCap = lens ? $('span', lens) : null;
      var srows = $$('.sindex__row', sindex);

      srows.forEach(function (row) {
        row.addEventListener('mouseenter', function () {
          srows.forEach(function (r) { r.classList.remove('is-on'); });
          row.classList.add('is-on');
          if (lens) {
            var src = row.getAttribute('data-img');
            if (lensImg && src && lensImg.getAttribute('src') !== src) lensImg.setAttribute('src', src);
            if (lensCap) lensCap.textContent = row.getAttribute('data-cap') || '';
            lens.classList.add('is-on');
          }
        });
        row.addEventListener('mousemove', function (e) {
          if (!lens) return;
          lens.style.left = e.clientX + 'px';
          lens.style.top = e.clientY + 'px';
        });
        row.addEventListener('mouseleave', function () {
          row.classList.remove('is-on');
          if (lens) lens.classList.remove('is-on');
        });
      });

      var sList = $('.sindex__list', sindex);
      if (hasST && !reduced && sList) {
        gsap.fromTo(srows, { y: 40, opacity: 0, clipPath: 'inset(0 100% 0 0)' },
          {
            y: 0, opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: .9, ease: 'expo.out', stagger: .08,
            scrollTrigger: {
              trigger: sList, start: 'top 80%',
              onEnter: function () { sList.classList.add('is-in'); }
            }
          });
      } else if (sList) {
        sList.classList.add('is-in');
      }
    }

    /* ================================================================
       S3 · PILLARS — 3D FLIP DECK
       ================================================================ */
    var flipGrid = $('#svcFlip');
    if (flipGrid && hasST && !reduced) {
      gsap.fromTo($$('.sflip__cell', flipGrid),
        { y: 70, opacity: 0, rotateX: -30, transformPerspective: 1100 },
        {
          y: 0, opacity: 1, rotateX: 0, duration: 1, ease: 'expo.out', stagger: .12,
          scrollTrigger: { trigger: flipGrid, start: 'top 82%' }
        });
    }

    /* ================================================================
       S4 · VISION LAB — PARALLAX COLUMNS
       ================================================================ */
    var colsWrap = $('#svcCols');
    if (colsWrap) {
      var cols = $$('.scols__col', colsWrap);
      if (hasST && !reduced) {
        gsap.fromTo($$('.scols__fig', colsWrap), { opacity: 0, y: 40 },
          {
            opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: .09,
            scrollTrigger: { trigger: colsWrap, start: 'top 84%' }
          });
        if (window.innerWidth > 900) {
          cols.forEach(function (col, i) {
            var amount = i === 1 ? 130 : (i === 2 ? 90 : 60);
            gsap.fromTo(col, { y: amount }, {
              y: -amount, ease: 'none',
              scrollTrigger: { trigger: colsWrap, start: 'top bottom', end: 'bottom top', scrub: 1 }
            });
          });
        }
      }
    }

    /* ================================================================
       S5 · PRECISION — COMPARE SLIDER
       ================================================================ */
    var cmp = $('#svcCompare');
    if (cmp) {
      var stage = cmp;
      var range = $('.scmp__range', cmp);
      var applyCut = function (v) { if (stage) stage.style.setProperty('--cut', v + '%'); };
      if (range) {
        range.addEventListener('input', function () { applyCut(range.value); });
        applyCut(range.value);
      }
      if (hasST && !reduced && stage) {
        gsap.fromTo(stage, { clipPath: 'inset(0 0 100% 0)', y: 50, opacity: 0 },
          {
            clipPath: 'inset(0 0 0% 0)', y: 0, opacity: 1, duration: 1.2, ease: 'expo.out',
            scrollTrigger: { trigger: stage, start: 'top 84%' }
          });
      }
    }

    /* ================================================================
       S6 · PROTOCOL — EXPANDING PANELS
       ================================================================ */
    var panelRow = $('#svcPanels');
    if (panelRow) {
      var panels = $$('.sexp__panel', panelRow);
      var activate = function (p) {
        panels.forEach(function (x) { x.classList.toggle('is-on', x === p); });
      };
      panels.forEach(function (p) {
        p.addEventListener('mouseenter', function () { activate(p); });
        p.addEventListener('click', function () { activate(p); });
        p.addEventListener('focusin', function () { activate(p); });
      });
      if (panels[0]) activate(panels[0]);
      if (hasST && !reduced) {
        gsap.fromTo(panels, { y: 60, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .1,
            scrollTrigger: { trigger: panelRow, start: 'top 84%' }
          });
      }
    }

    /* ================================================================
       S7 · MILESTONES — CENTRE TIMELINE
       ================================================================ */
    var tlTrack = $('#svcTimeline');
    if (tlTrack) {
      var tlItems = $$('.stl__item', tlTrack);
      var tlFill = $('.stl__fill', tlTrack);
      if (hasST && !reduced) {
        if (tlFill) {
          gsap.fromTo(tlFill, { scaleY: 0 }, {
            scaleY: 1, ease: 'none',
            scrollTrigger: { trigger: tlTrack, start: 'top 70%', end: 'bottom 76%', scrub: .6 }
          });
        }
        tlItems.forEach(function (item) {
          var media = $('.stl__media', item);
          var body = $('.stl__body', item);
          var even = (tlItems.indexOf(item) % 2) === 1;
          var dir = even ? 1 : -1;
          var tl = gsap.timeline({
            scrollTrigger: {
              trigger: item, start: 'top 82%',
              onEnter: function () { item.classList.add('is-in'); }
            }
          });
          if (media) tl.fromTo(media, { x: 52 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'expo.out' }, 0);
          if (body) tl.fromTo(body, { x: -52 * dir, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'expo.out' }, .1);
        });
      } else {
        tlItems.forEach(function (item) { item.classList.add('is-in'); });
      }
    }

    /* ================================================================
       S8 · MOSAIC — SPOTLIGHT GRID
       ================================================================ */
    var mosaic = $('#svcMosaic');
    if (mosaic) {
      var tiles = $$('.smos__tile', mosaic);
      tiles.forEach(function (t) {
        t.addEventListener('mouseenter', function () { mosaic.classList.add('is-focus'); });
        t.addEventListener('mouseleave', function () { mosaic.classList.remove('is-focus'); });
      });
      if (hasST && !reduced) {
        gsap.fromTo(tiles,
          {
            opacity: 0,
            y: function () { return 40 + Math.random() * 70; },
            x: function () { return (Math.random() - .5) * 80; },
            rotate: function () { return (Math.random() - .5) * 10; }
          },
          {
            opacity: 1, y: 0, x: 0, rotate: 0, duration: 1.1, ease: 'expo.out',
            stagger: { each: .06, from: 'random' },
            scrollTrigger: { trigger: mosaic, start: 'top 84%' }
          });
      }
    }

    /* ================================================================
       S9 · INSIGHTS — MAGAZINE OVERLAP
       ================================================================ */
    var mag = $('#svcMag');
    if (mag) {
      var magMain = $('.smag__main', mag);
      var magOver = $('.smag__over', mag);
      var magBody = $('.smag__body', mag);
      if (hasST && !reduced) {
        if (magMain) gsap.fromTo(magMain, { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: mag, start: 'top 82%' } });
        if (magBody) gsap.fromTo(magBody, { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: mag, start: 'top 82%' } });
        if (magOver) gsap.fromTo(magOver, { y: 70 }, {
          y: -70, ease: 'none',
          scrollTrigger: { trigger: mag, start: 'top bottom', end: 'bottom top', scrub: 1 }
        });
      }
    }

    /* ================================================================
       S10 · SIGNATURE — CLOSING BAND
       ================================================================ */
    var cta = $('#svcCta');
    if (cta && hasST && !reduced) {
      var ctaBg = $('.scta__bg img', cta);
      if (ctaBg) {
        gsap.fromTo(ctaBg, { scale: 1.24, yPercent: -8 }, {
          scale: 1.06, yPercent: 0, ease: 'none',
          scrollTrigger: { trigger: cta, start: 'top bottom', end: 'bottom top', scrub: true }
        });
      }
      gsap.fromTo($$('.scta__line > span', cta), { yPercent: 116 },
        { yPercent: 0, duration: 1.1, ease: 'expo.out', stagger: .1,
          scrollTrigger: { trigger: cta, start: 'top 80%' } });
      gsap.fromTo($$('.scta__eyebrow', cta), { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: .8, ease: 'expo.out',
          scrollTrigger: { trigger: cta, start: 'top 80%' } });
      gsap.fromTo($$('.scta__cta', cta), { scale: .9, opacity: 0 },
        { scale: 1, opacity: 1, duration: .8, ease: 'back.out(1.4)',
          scrollTrigger: { trigger: cta, start: 'top 78%' } });
      gsap.fromTo($$('.scta__chips a', cta), { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: .7, ease: 'expo.out', stagger: .08,
          scrollTrigger: { trigger: cta, start: 'top 78%' } });
    }

  });

})();