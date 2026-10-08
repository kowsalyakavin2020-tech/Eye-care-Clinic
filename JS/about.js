/* ==========================================================================
   STACKLY — EYE CARE CLINIC
   About Page behaviour  ·  about.js
   --------------------------------------------------------------------------
   Loaded AFTER home.js. Drives the twelve original about sections only.
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

  /* observe once, anywhere ----------------------------------------------- */
  function onceInView(el, fn, opts) {
    if (!('IntersectionObserver' in window)) { fn(); return; }
    var io = new IntersectionObserver(function (list) {
      list.forEach(function (x) {
        if (x.isIntersecting) { io.disconnect(); fn(); }
      });
    }, opts || { threshold: 0.25 });
    io.observe(el);
  }

  ready(function () {

    var startOK = hasGSAP && hasST && !reduced;

    /* ================================================================
       01 · HERO — CINEMATIC FILM FRAME
       ================================================================ */
    var hero = $('#abtHero');
    if (hero) {
      var lines = $$('.abt-hero__line > span', hero);
      var bars = $$('.abt-hero__bars i', hero);
      var portrait = $('.abt-hero__portrait', hero);
      var bg = $('.abt-hero__bg', hero);
      var tc = $('.abt-hero__tc', hero);

      /* live timecode */
      if (tc && !reduced) {
        var t0 = Date.now();
        var pad = function (n) { return (n < 10 ? '0' : '') + n; };
        setInterval(function () {
          var s = Math.floor((Date.now() - t0) / 1000);
          tc.textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
        }, 1000);
      }

      /* pointer spotlight (colour layer follows the cursor) */
      if (!isTouch) {
        var move = function (e) {
          var r = hero.getBoundingClientRect();
          hero.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100) + '%');
          hero.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100) + '%');
        };
        hero.addEventListener('pointermove', move);
        hero.addEventListener('pointerleave', function () {
          hero.style.setProperty('--mx', '50%');
          hero.style.setProperty('--my', '50%');
        });
      }

      if (startOK) {
        gsap.set(lines, { yPercent: 115 });
        gsap.set(bars, { height: '52%' });
        gsap.set(portrait, { clipPath: 'inset(0 0 100% 0)' });
        gsap.set(bg, { scale: 1.24 });
        gsap.set('.abt-hero__hud', { opacity: 0, y: 18 });
        gsap.set('.abt-hero__facts li', { opacity: 0, y: 18 });
        gsap.set('.abt-hero__foot .btn', { opacity: 0, y: 16 });

        afterPreloader(function () {
          gsap.timeline({ defaults: { ease: 'expo.out' } })
            .to(bars, { height: '0%', duration: 1.1, ease: 'expo.inOut' }, 0)
            .to(bg, { scale: 1, duration: 1.9 }, 0)
            .fromTo(lines, { yPercent: 115 }, { yPercent: 0, duration: 1.15, stagger: .1 }, .12)
            .to('.abt-hero__hud', { opacity: 1, y: 0, duration: .7 }, .5)
            .to('.abt-hero__facts li', { opacity: 1, y: 0, duration: .7, stagger: .08 }, .6)
            .to('.abt-hero__foot .btn', { opacity: 1, y: 0, duration: .7, clearProps: 'transform,opacity' }, .8)
            .fromTo(portrait, { clipPath: 'inset(0 0 100% 0)' },
              { clipPath: 'inset(0 0 0% 0)', duration: 1, ease: 'expo.inOut' }, .55);
        });

        gsap.to(bg, {
          yPercent: 10, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
      }
    }

    /* ================================================================
       02 · STORY — CHAPTER LEDGER
       ================================================================ */
    var story = $('#abtStory');
    if (story) {
      var chapters = $$('.abt-story__chapters li', story);
      var entries = $$('.abt-story__entry', story);

      entries.forEach(function (entry, i) {
        entry.classList.add('is-armed');
        if (startOK) {
          gsap.from(entry, {
            opacity: 0, y: 30, duration: .9, ease: 'expo.out',
            scrollTrigger: { trigger: entry, start: 'top 82%', once: true }
          });
        }
        onceInView(entry, function () {
          entry.classList.add('is-in');
          chapters.forEach(function (c, ci) { c.classList.toggle('is-on', ci === i); });
        }, { rootMargin: '-35% 0px -35% 0px' });
      });

      chapters.forEach(function (c, i) {
        c.addEventListener('click', function () {
          if (entries[i]) entries[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' });
        });
      });
    }

    /* ================================================================
       03 · MISSION — PANORAMA WINDOW
       ================================================================ */
    var missionWin = $('#abtPanorama');
    if (missionWin && startOK) {
      var pano = $('.abt-mission__panorama', missionWin);
      gsap.from('.abt-mission__head > *', {
        opacity: 0, y: 24, duration: .8, stagger: .1, ease: 'expo.out',
        scrollTrigger: { trigger: missionWin, start: 'top 82%', once: true }
      });
      if (pano) {
        gsap.fromTo(pano, { xPercent: 0 }, {
          xPercent: -66.6667, ease: 'none',
          scrollTrigger: { trigger: missionWin, start: 'top 72%', end: 'bottom top', scrub: true }
        });
      }
      gsap.to('.abt-mission__rail i', {
        width: '100%', ease: 'none',
        scrollTrigger: { trigger: missionWin, start: 'top 72%', end: 'bottom top', scrub: true }
      });
    }

    /* ================================================================
       03 · VALUES — VERTICAL ACCORDION
       ================================================================ */
    var vals = $$('.abt-val');
    if (vals.length) {
      vals.forEach(function (v) {
        var bar = $('.abt-val__bar', v);
        if (!bar) return;
        bar.setAttribute('role', 'button');
        bar.setAttribute('tabindex', '0');
        var toggle = function () {
          var wasOn = v.classList.contains('is-on');
          vals.forEach(function (o) { o.classList.remove('is-on'); });
          if (!wasOn) v.classList.add('is-on');
        };
        bar.addEventListener('click', toggle);
        bar.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
        });
      });
      if (startOK) {
        gsap.from('.abt-values__stack', {
          opacity: 0, y: 26, duration: .8, ease: 'expo.out',
          scrollTrigger: { trigger: '.abt-values__stack', start: 'top 82%', once: true }
        });
      }
    }

    /* ================================================================
       05 · NUMBERS — ODOMETER
       ================================================================ */
    var odo = $('#abtOdo');
    if (odo) {
      var figures = $$('.abt-odo__figure', odo);
      figures.forEach(function (fig) {
        var val = (fig.getAttribute('data-value') || '').trim();
        var frag = document.createDocumentFragment();
        val.split('').forEach(function (ch) {
          var col = document.createElement('span');
          col.className = 'abt-odo__col';
          col.setAttribute('data-d', ch);
          var strip = document.createElement('span');
          strip.className = 'abt-odo__strip';
          for (var d = 0; d < 10; d++) {
            var it = document.createElement('i');
            it.textContent = d;
            strip.appendChild(it);
          }
          col.appendChild(strip);
          frag.appendChild(col);
        });
        fig.insertBefore(frag, fig.firstChild);
      });

      var spin = function () {
        figures.forEach(function (fig) {
          $$('.abt-odo__col', fig).forEach(function (col, i) {
            var d = parseInt(col.getAttribute('data-d'), 10);
            var strip = $('.abt-odo__strip', col);
            if (!strip || isNaN(d)) return;
            if (startOK) {
              gsap.to(strip, { yPercent: -d * 10, duration: 1.3, delay: .35 + i * .09, ease: 'expo.out' });
            } else {
              strip.style.transform = 'translateY(' + (-d * 10) + '%)';
            }
          });
        });
      };
      onceInView(odo, spin, { threshold: 0.35 });
    }

    /* ================================================================
       06 · TRAIL — ASCENDING STEPS
       ================================================================ */
    var trailSteps = $('#abtTrailSteps');
    if (trailSteps && startOK) {
      gsap.from('.abt-step', {
        opacity: 0, duration: .8, stagger: .12, ease: 'expo.out',
        scrollTrigger: { trigger: trailSteps, start: 'top 80%', once: true }
      });
      gsap.to('.abt-trail__path i', {
        width: '100%', ease: 'none',
        scrollTrigger: { trigger: trailSteps, start: 'top 82%', end: 'bottom 62%', scrub: true }
      });
      gsap.to('.abt-step__media img', {
        yPercent: 14, ease: 'none',
        scrollTrigger: { trigger: trailSteps, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    }

    /* ================================================================
       07 · TEAM — CONTACT SHEET
       ================================================================ */
    var team = $('#abtTeam');
    if (team && startOK) {
      gsap.from('.abt-roster__row', {
        opacity: 0, y: 26, duration: .7, stagger: .1, ease: 'expo.out',
        scrollTrigger: { trigger: '.abt-roster', start: 'top 82%', once: true }
      });
    }

    /* ================================================================
       08 · APPROACH — MASK WINDOW PAN
       ================================================================ */
    var mask = $('#abtMask');
    if (mask) {
      var aimg = $('.abt-approach__img', mask);
      if (aimg && startOK) {
        gsap.fromTo(aimg, { yPercent: 0 }, {
          yPercent: function () {
            var mh = mask.clientHeight, ih = aimg.offsetHeight;
            return ih > mh ? -((ih - mh) / ih) * 100 : 0;
          },
          ease: 'none',
          scrollTrigger: {
            trigger: mask, start: 'top bottom', end: 'bottom top',
            scrub: true, invalidateOnRefresh: true
          }
        });
      }
      if (startOK) {
        gsap.from('.abt-approach__copy > *', {
          opacity: 0, y: 24, duration: .8, stagger: .08, ease: 'expo.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '#abtApproach', start: 'top 78%', once: true }
        });
      }
    }

    /* ================================================================
       09 · VOICES — WORD HIGHLIGHT
       ================================================================ */
    var quote = $('#abtQuote');
    if (quote) {
      var text = quote.getAttribute('data-quote') || quote.textContent || '';
      var words = text.split(/\s+/).filter(Boolean);
      quote.textContent = '';
      words.forEach(function (w, i) {
        var s = document.createElement('span');
        s.className = 'abt-voices__w';
        s.textContent = w;
        quote.appendChild(s);
        if (i < words.length - 1) quote.appendChild(document.createTextNode(' '));
      });
      var wSpans = $$('.abt-voices__w', quote);
      if (startOK && wSpans.length) {
        gsap.set(wSpans, { opacity: .14 });
        gsap.to(wSpans, {
          opacity: 1, ease: 'none', stagger: .12,
          scrollTrigger: { trigger: quote, start: 'top 80%', end: 'bottom 55%', scrub: true }
        });
      }
    }

    /* ================================================================
       10 · CULTURE — ASSEMBLING MOSAIC
       ================================================================ */
    var mosaic = $('#abtMosaic');
    if (mosaic) {
      mosaic.classList.add('is-armed');
      onceInView(mosaic, function () { mosaic.classList.add('is-in'); }, { threshold: 0.2 });
    }

    /* ================================================================
       11 · RECOGNITION — CABINET SHELF
       ================================================================ */
    var recog = $('#abtRecog');
    if (recog && startOK) {
      gsap.from('.abt-shelf', {
        opacity: 0, y: 30, duration: .8, stagger: .15, ease: 'expo.out',
        scrollTrigger: { trigger: recog, start: 'top 80%', once: true }
      });
      gsap.from('.abt-plaque', {
        opacity: 0, y: 22, duration: .6, stagger: .06, ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: recog, start: 'top 78%', once: true }
      });
    }

    /* ================================================================
       12 · CTA — POSTCARD
       ================================================================ */
    var cta = $('#abtCta');
    if (cta && startOK) {
      gsap.from('.abt-postcard', {
        opacity: 0, y: 34, duration: .9, ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: cta, start: 'top 82%', once: true }
      });
      gsap.from('.abt-postcard__media img', {
        opacity: 0, scale: 1.08, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: cta, start: 'top 82%', once: true }
      });
    }

    /* refresh once everything (fonts / images) has settled */
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); });

  });
})();