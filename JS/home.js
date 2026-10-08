/* ==========================================================================
   STACKLY — EYE CARE CLINIC
   Landing page behaviour  ·  home.js
   Preloader · Lenis · GSAP ScrollTrigger · AOS · cursor · micro-interactions
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isTouch = window.matchMedia('(hover: none)').matches;
  var hasGSAP = typeof window.gsap !== 'undefined';
  var hasST = hasGSAP && typeof window.ScrollTrigger !== 'undefined';
  var hasLenis = typeof window.Lenis !== 'undefined';

  if (hasGSAP && hasST) gsap.registerPlugin(ScrollTrigger);

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function page404() { return /\/HTML\//i.test(window.location.pathname) ? '404.html' : 'HTML/404.html'; }

  /* ========================================================================
     01 · PRELOADER
     ===================================================================== */
  var preloader = $('#preloader');
  var plBar = $('#plBar');
  var plNum = $('#plNum');
  var plNote = $('#plNote');
  var brandLetters = $$('.pl-brand span');
  var NOTES = [
    [0, 'Calibrating diagnostics'],
    [22, 'Mapping the retina'],
    [46, 'Focusing the lens'],
    [68, 'Aligning the iris'],
    [88, 'Sharpening the grid'],
    [99, 'Ready']
  ];

  var progress = 0, target = 0, startedAt = Date.now(), loaderDone = false;

  function noteFor(p) {
    var label = NOTES[0][1];
    for (var i = 0; i < NOTES.length; i++) if (p >= NOTES[i][0]) label = NOTES[i][1];
    if (plNote && plNote.textContent !== label) plNote.textContent = label;
  }

  function paintLoader() {
    if (plBar) plBar.style.width = progress + '%';
    if (plNum) plNum.textContent = Math.round(progress);
    noteFor(progress);
    var lit = Math.round((progress / 100) * brandLetters.length);
    brandLetters.forEach(function (el, i) { el.classList.toggle('on', i < lit); });
    var iris = $('.pl-eye__iris'), pupil = $('.pl-eye__pupil');
    if (iris) iris.style.transform = 'scale(' + (0.84 + progress / 440) + ') rotate(' + (progress * 3.4) + 'deg)';
    if (pupil) pupil.style.transform = 'scale(' + (1 + (50 - Math.abs(progress - 50)) / 52) + ')';
  }

  var loadTick = setInterval(function () {
    var ready = document.readyState === 'complete';
    var elapsed = Date.now() - startedAt;
    if (ready && elapsed > 850) target = 100;
    else target = Math.min(96, target + (reduced ? 16 : 1.6 + Math.random() * 3.4));
    progress = lerp(progress, target, 0.16);
    paintLoader();
    if (progress > 99.3 && ready) {
      clearInterval(loadTick); progress = 100; paintLoader();
      setTimeout(exitLoader, 340);
    } else if (elapsed > 11000) {
      clearInterval(loadTick); progress = 100; paintLoader(); exitLoader();
    }
  }, 40);

  function exitLoader() {
    if (loaderDone) return;
    loaderDone = true;
    document.body.classList.remove('is-locked');
    var inner = $('.preloader__inner');
    var panes = $$('.preloader__shutter span');
    var grid = $('.preloader__grid');

    if (hasGSAP && !reduced) {
      gsap.timeline({
        onComplete: function () {
          preloader.style.display = 'none';
          introHero();
          if (hasST) ScrollTrigger.refresh();
        }
      })
        .to(inner, { y: -34, opacity: 0, filter: 'blur(6px)', duration: .5, ease: 'power3.in' })
        .to(grid, { opacity: 0, duration: .45 }, '<')
        .to(panes, {
          xPercent: function (i) { return i === 0 ? -102 : 102; },
          rotate: function (i) { return i === 0 ? -4 : 4; },
          duration: 1.05, ease: 'expo.inOut'
        }, '-=.2')
        .set(preloader, { display: 'none' });
    } else {
      preloader.style.display = 'none';
      introHero();
    }
  }

  /* ========================================================================
     02 · LENIS + SCROLLTRIGGER BRIDGE
     ===================================================================== */
  var lenis = null;
  if (hasLenis && !reduced) {
    lenis = new Lenis({
      duration: 1.15,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true, wheelMultiplier: 1, touchMultiplier: 1.7, infinite: false
    });
    lenis.stop();
    if (hasST) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    } else {
      (function raf(t) { lenis.raf(t); requestAnimationFrame(raf); })(0);
    }
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); });
  }
  function startScroll() { if (lenis) lenis.start(); }

  /* anchors --------------------------------------------------------------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href');
      if (!id || id === '#') return;
      var el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      closeDrawer();
      if (lenis) lenis.scrollTo(el, { offset: -68, duration: 1.3 });
      else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
    });
  });

  /* ========================================================================
     03 · AOS + GENERIC REVEALS
     ===================================================================== */
  /* hand the rebuilt sections to GSAP (drop AOS/dataset reveals to avoid conflicts) */
  $$('.prog2__row, .prog2__body, .prog2__pic')
    .forEach(function (el) {
      el.removeAttribute('data-aos');
      el.removeAttribute('data-reveal');
    });

  if (typeof window.AOS !== 'undefined') {
    AOS.init({
      duration: reduced ? 0 : 900,
      easing: 'ease-out-cubic',
      once: true,
      offset: 70,
      disable: reduced
    });
  }

  function setRing(node, pct) {
    if (!node) return;
    if (reduced || !hasGSAP) { node.style.setProperty('--p', pct + '%'); return; }
    var o = { v: parseFloat(node.style.getPropertyValue('--p')) || 0 };
    gsap.to(o, {
      v: pct, duration: 1.6, ease: 'power3.out',
      onUpdate: function () { node.style.setProperty('--p', o.v.toFixed(2) + '%'); }
    });
  }
  function drawRing(node, pct) { setRing(node, pct); }

  function countUp(el) {
    if (!el) return;
    var nodes = [];
    if (el.hasAttribute && el.hasAttribute('data-count')) nodes.push(el);
    nodes = nodes.concat($$('[data-count]', el));
    nodes.forEach(function (node) {
      if (node.dataset.done) return;
      node.dataset.done = '1';
      var end = parseFloat(node.getAttribute('data-count'));
      var suffix = node.getAttribute('data-suffix') || '';
      if (reduced) { node.textContent = end + suffix; return; }
      var t0 = performance.now(), dur = 1700;
      (function step(t) {
        var p = clamp((t - t0) / dur, 0, 1);
        var e = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(end * e) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else node.textContent = end + suffix;
      })(t0);
    });
  }

  function watch(sel, cls, opts) {
    opts = opts || {};
    var els = $$(sel);
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add(cls); if (opts.fire) opts.fire(e); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          var el = en.target;
          setTimeout(function () { el.classList.add(cls); }, parseInt(el.getAttribute('data-delay') || 0, 10));
          if (opts.fire) opts.fire(el);
          io.unobserve(el);
        }
      });
    }, { threshold: opts.threshold || 0.2, rootMargin: opts.rootMargin || '0px 0px -6% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  watch('[data-reveal]:not([data-aos])', 'is-in');
  watch('.rv-words', 'is-in');
  watch('.scard--stat', 'is-in', { threshold: .3, fire: countUp });
  watch('.gcard', 'is-in', { threshold: .35, fire: countUp });
  watch('[data-aperture]', 'is-in', { threshold: .3 });
  watch('.hero2__stats', 'is-in', { threshold: .4, fire: countUp });

  /* ========================================================================
     04 · TEXT SPLITTING
     ===================================================================== */
  $$('[data-split]').forEach(function (el) {
    var words = (el.textContent || '').trim().split(/\s+/);
    el.textContent = '';
    words.forEach(function (w, i) {
      var span = document.createElement('span');
      span.className = 'w';
      var inner = document.createElement('i');
      inner.textContent = w;
      inner.style.transitionDelay = (i * 0.05) + 's';
      span.appendChild(inner);
      el.appendChild(span);
      if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
    });
  });

  /* ========================================================================
     05 · CUSTOM CURSOR
     ===================================================================== */
  var cursor = $('#cursor');
  if (cursor && !isTouch) {
    var cx = window.innerWidth / 2, cy = window.innerHeight / 2, tx = cx, ty = cy;
    window.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx = lerp(cx, tx, .18); cy = lerp(cy, ty, .18);
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseleave', function () { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', function () { cursor.style.opacity = '1'; });
  }

  /* ========================================================================
     06 · HEADER + DRAWER
     ===================================================================== */
  var hdr = $('#hdr');
  var progBar = $('#progBar');
  var lastY = 0;

  function syncNav(y) {
    var links = $$('.nav__link'), best = null;
    links.forEach(function (l) {
      var href = l.getAttribute('href') || '';
      if (href.charAt(0) !== '#') return;
      var sec;
      try { sec = document.querySelector(href); } catch (err) { return; }
      if (sec && sec.offsetTop - 200 <= y) best = l;
    });
    links.forEach(function (l) { l.classList.toggle('is-active', l === best); });
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset || 0;
    if (hdr) {
      hdr.classList.toggle('is-solid', y > 40);
      hdr.classList.remove('is-hidden');
    }
    lastY = y;
    if (progBar) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progBar.style.width = clamp((y / (h || 1)) * 100, 0, 100) + '%';
    }
    syncNav(y);
    positionOrb();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (lenis) lenis.on('scroll', onScroll);
  onScroll();

  var nav = $('#nav'), orb = $('#navOrb');
  function positionOrb() {
    if (!nav || !orb) return;
    var active = nav.querySelector('.nav__link.is-active') || nav.querySelector('.nav__link.is-current');
    var list = nav.querySelector('.nav__list');
    if (!active || !list) { orb.classList.remove('is-on'); return; }
    var nb = active.getBoundingClientRect(), pb = list.getBoundingClientRect();
    if (!nb.width) { orb.classList.remove('is-on'); return; }
    orb.style.width = nb.width + 'px';
    orb.style.height = nb.height + 'px';
    orb.style.transform = 'translate(' + (nb.left - pb.left) + 'px,' + (nb.top - pb.top) + 'px)';
    orb.classList.add('is-on');
  }
  positionOrb();
  window.addEventListener('resize', positionOrb);
  window.addEventListener('load', positionOrb);

  var menu = $('#mmenu'), burger = $('#burger');
  function openDrawer() {
    if (!menu) return;
    menu.classList.add('is-open');
    menu.setAttribute('aria-hidden', 'false');
    if (burger) { burger.classList.add('on'); burger.setAttribute('aria-expanded', 'true'); }
    document.body.classList.add('is-locked');
    if (lenis) lenis.stop();
  }
  function closeDrawer() {
    if (!menu || !menu.classList.contains('is-open')) return;
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    if (burger) { burger.classList.remove('on'); burger.setAttribute('aria-expanded', 'false'); }
    document.body.classList.remove('is-locked');
    if (lenis) lenis.start();
  }
  if (burger) burger.addEventListener('click', function () {
    menu.classList.contains('is-open') ? closeDrawer() : openDrawer();
  });
  var menuClose = $('#mmenuClose');
  if (menuClose) menuClose.addEventListener('click', closeDrawer);
  $$('.mmenu__links a').forEach(function (a) { a.addEventListener('click', closeDrawer); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawer(); });

  /* ========================================================================
     07 · MARQUEES (scroll-velocity aware)
     ===================================================================== */
  var scrollVelocity = 0, prevScroll = 0;
  function trackVel(y) {
    scrollVelocity = clamp(y - prevScroll, -60, 60);
    prevScroll = y;
  }
  if (lenis) lenis.on('scroll', function (e) { trackVel(e.scroll || 0); });
  else window.addEventListener('scroll', function () { trackVel(window.scrollY || 0); }, { passive: true });
  setInterval(function () { scrollVelocity *= .8; }, 90);

  function marquee(row, dir, base) {
    if (!row) return;
    var x = 0, half = 0;
    function measure() { half = row.scrollWidth / 2; }
    measure();
    window.addEventListener('resize', measure);
    (function step() {
      if (!reduced && half > 0) {
        x += base * dir * (1 + Math.min(3, Math.abs(scrollVelocity) / 24));
        if (dir > 0) { if (x <= -half) x += half; if (x > 0) x -= half; }
        else { if (x >= 0) x -= half; if (x < -half) x += half; }
        row.style.transform = 'translate3d(' + x + 'px,0,0)';
      }
      requestAnimationFrame(step);
    })();
  }
  $$('.mq__row').forEach(function (r) { marquee(r, parseFloat(r.getAttribute('data-dir') || 1), .6); });
  $$('.railband__track').forEach(function (r) { marquee(r, parseFloat(r.getAttribute('data-dir') || 1), .45); });

  /* ========================================================================
     08 · SEAL — curved lettering without SVG
     ===================================================================== */
  $$('.seal__ring span').forEach(function (span) {
    var chars = (span.textContent || '').split('');
    span.textContent = '';
    chars.forEach(function (ch, i) {
      var b = document.createElement('b');
      b.textContent = ch === ' ' ? '\u00a0' : ch;
      b.style.transform = 'rotate(' + (i * (360 / chars.length)) + 'deg)';
      span.appendChild(b);
    });
  });

  /* ========================================================================
     09 · HERO
     ===================================================================== */
  var hero = $('.hero2');

  function introHero() {
    if (hero) hero.classList.add('is-in');
    startScroll();
    if (!hasGSAP || reduced) {
      $$('.rv-line > span').forEach(function (s) { s.style.transform = 'none'; });
      $$('.hero2__eb, .hero2__lead, .hero2__cta > *, .hero2__stats li, .hero2__deck, .hero2__strip')
        .forEach(function (s) { s.style.opacity = 1; s.style.transform = 'none'; });
      countUp($('.hero2__stats'));
      return;
    }
    gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: function () {
        $$('.hero2__panel').forEach(function (p) { p.style.removeProperty('transform'); });
      }
    })
      .fromTo('.hero2__washimg', { scale: 1.32, filter: 'grayscale(1) contrast(1.3) brightness(.12)' },
        { scale: 1.14, filter: 'grayscale(1) contrast(1.16) brightness(.34)', duration: 1.8 }, 0)
      .fromTo('.hero2__eb', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .9 }, .1)
      .fromTo('.hero2__title .rv-line > span', { yPercent: 118, rotate: 3 },
        { yPercent: 0, rotate: 0, duration: 1.3, stagger: .11 }, .16)
      .fromTo('.hero2__lead', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, .58)
      .fromTo('.hero2__cta > *', { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .1 }, .72)
      .fromTo('.hero2__panel--a', { clipPath: 'inset(0% 0% 100% 0%)', y: 84 },
        { clipPath: 'inset(0% 0% 0% 0%)', y: 0, duration: 1.4 }, .22)
      .fromTo('.hero2__panel--b', { y: 64, opacity: 0, scale: .9 }, { y: 0, opacity: 1, scale: 1, duration: 1.1 }, .56)
      .fromTo('.hero2__panel--c', { y: 64, opacity: 0, scale: .86 }, { y: 0, opacity: 1, scale: 1, duration: 1.1 }, .7)
      .fromTo('.hero2__badge', { scale: 0, rotate: -140, opacity: 0 }, { scale: 1, rotate: 0, opacity: 1, duration: 1.1, ease: 'back.out(1.6)' }, .9)
      .fromTo('.hero2__stats li', { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: .9, stagger: .1, onStart: function () { countUp($('.hero2__stats')); } }, .82)
      .fromTo('.hero2__strip', { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1 }, 1.05);
  }

  if (hasST && !reduced && hero) {
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 1 } })
      .to('.hero2__washimg', { yPercent: 15, scale: 1.22 }, 0)
      .to('.hero2__copy', { y: -70, opacity: .18 }, 0)
      .to('.hero2__deck', { y: -60 }, 0);
  }

  if (!isTouch) {
    $$('.hero2__panel').forEach(function (panel) {
      panel.addEventListener('mousemove', function (e) {
        var r = panel.getBoundingClientRect();
        panel.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%');
        panel.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%');
      });
    });
  }

  /* ========================================================================
     10 · ABOUT
     ===================================================================== */
  if (hasST && !reduced) {
    var polas = $$('.pola');
    if (polas.length) {
      gsap.fromTo(polas,
        { y: 80, rotate: function (i) { return i % 2 ? 18 : -18; }, opacity: 0 },
        {
          y: 0,
          rotate: function (i, t) { return parseFloat(getComputedStyle(t).getPropertyValue('--rot')) || 0; },
          opacity: 1, stagger: .14, duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '.polaroids', start: 'top 84%' }
        });
    }
    gsap.fromTo('.about__year b', { yPercent: 115 }, {
      yPercent: 0, duration: 1, ease: 'expo.out',
      scrollTrigger: { trigger: '.about__year', start: 'top 94%' }
    });
  }

    /* ========================================================================
     11 · SERVICES  -  expanding bento
     ===================================================================== */
  if (hasST && !reduced) {
    gsap.fromTo('.svcx__item',
      { y: 44, opacity: 0, clipPath: 'inset(100% 0 0 0)' },
      {
        y: 0, opacity: 1, clipPath: 'inset(0% 0 0 0)', duration: 1.1, ease: 'expo.out',
        stagger: .09,
        scrollTrigger: { trigger: '.svcx__rack', start: 'top 82%' }
      });
  }

    /* ========================================================================
     12 - SPECIALISTS  -  mosaic wall
     ===================================================================== */
  var specBento = $('#specBento');
  if (specBento) {
    var stiles = $$('.scard', specBento);
    if (hasST && !reduced) {
      gsap.fromTo(stiles, { y: 64, opacity: 0 }, {
        y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .09,
        scrollTrigger: { trigger: specBento, start: 'top 82%' }
      });
    }
  }

/* ========================================================================
     13 · METHOD — sticky stage
     ===================================================================== */
  var mSteps = $$('.mstep');
  var mFigs = $$('.method__visual figure');
  var gRing = $('.method__gauge .ring'), gNum = $('#gNum'), gLbl = $('#gLbl');
  var LABELS = ['Intake', 'Diagnose', 'Treat', 'Protect'];
  var mActive = -1;

  function setMethod(i) {
    if (i === mActive || i < 0) return;
    mActive = i;
    mSteps.forEach(function (s, n) { s.classList.toggle('is-on', n === i); });
    mFigs.forEach(function (f, n) { f.classList.toggle('is-on', n === i); });
    if (gNum) gNum.textContent = '0' + (i + 1);
    if (gLbl) gLbl.textContent = LABELS[i];
    setRing(gRing, ((i + 1) / 4) * 94);
  }

  if (mSteps.length) {
    if (hasST && !reduced) {
      mSteps.forEach(function (s, i) {
        ScrollTrigger.create({
          trigger: s, start: 'top 64%', end: 'bottom 46%',
          onEnter: function () { setMethod(i); },
          onEnterBack: function () { setMethod(i); }
        });
      });
    } else if ('IntersectionObserver' in window) {
      var mio = new IntersectionObserver(function (en) {
        en.forEach(function (e) {
          if (e.isIntersecting) setMethod(mSteps.indexOf(e.target));
        });
      }, { threshold: .45 });
      mSteps.forEach(function (s) { mio.observe(s); });
    }
    setMethod(0);
  }

    /* ========================================================================
     14 · TECHNOLOGY  -  instrument console
     ===================================================================== */
  var lab = $('#lab2');
  if (lab) {
    var labRows = $$('.lab2__row', lab);
    var labPanels = $$('.lab2__panel', lab);

    function setLab(i) {
      labRows.forEach(function (r, n) { r.classList.toggle('is-on', n === i); });
      labPanels.forEach(function (p, n) { p.classList.toggle('is-on', n === i); });
    }
    labRows.forEach(function (row) {
      var idx = parseInt(row.getAttribute('data-lab'), 10);
      var go = function () { setLab(idx); };
      row.addEventListener('mouseenter', go);
      row.addEventListener('focus', go);
      row.addEventListener('click', go);
    });

    if (hasST && !reduced) {
      gsap.fromTo('.lab2__row', { x: -34, opacity: 0 },
        {
          x: 0, opacity: 1, duration: .8, stagger: .07, ease: 'expo.out',
          scrollTrigger: { trigger: '.lab2__in', start: 'top 82%' }
        });
      gsap.fromTo('.lab2__stage', { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'expo.out',
          scrollTrigger: { trigger: '.lab2__stage', start: 'top 90%' }
        });
    }
  }

  /* ========================================================================
     15 · TREATMENTS  -  alternating editorial programmes
     ===================================================================== */
  if (hasST && !reduced) {
    $$('.prog2__row').forEach(function (row) {
      var pic = $('.prog2__pic', row);
      var body = $('.prog2__body', row);
      var dir = row.classList.contains('prog2__row--rev') ? -1 : 1;
      if (pic) {
        gsap.fromTo(pic, { x: 60 * dir, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 1.05, ease: 'expo.out',
            scrollTrigger: { trigger: row, start: 'top 84%' }
          });
      }
      if (body) {
        gsap.fromTo(body, { x: -70 * dir, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 1.05, ease: 'expo.out',
            scrollTrigger: { trigger: row, start: 'top 84%' }
          });
      }
    });
  }

    /* ========================================================================
     16 - NUMBERS  -  benchmark filmstrip (count-up via the watcher)
     ===================================================================== */
  var gaugePin = $('#gaugePin');
  var gaugeTrack = $('#gaugeTrack');
  var gaugeBar = $('#gaugeBar');
  if (gaugePin && gaugeTrack && hasST && !reduced) {
    gsap.fromTo('.gcard', { y: 44, opacity: 0 }, {
      y: 0, opacity: 1, duration: 1, ease: 'expo.out', stagger: .1,
      scrollTrigger: { trigger: '.gauge', start: 'top 82%' }
    });
    if (window.innerWidth > 900) {
      var gaugeDist = function () { return Math.max(0, gaugeTrack.scrollWidth - gaugePin.clientWidth); };
      gsap.to(gaugeTrack, {
        x: function () { return -gaugeDist(); },
        ease: 'none',
        scrollTrigger: {
          trigger: gaugePin, start: 'top 72px',
          end: function () { return '+=' + (gaugeDist() + window.innerHeight * .4); },
          pin: true, scrub: 1, invalidateOnRefresh: true,
          onUpdate: function (self) { if (gaugeBar) gaugeBar.style.width = (self.progress * 100) + '%'; }
        }
      });
    }
  }

/* ========================================================================
     17 · VOICES — 3D coverflow
     ===================================================================== */
  var stage = $('#stage3d');
  if (stage) {
    var vcards = $$('.vcard', stage);
    var dots = $$('#vDots button');
    var active = 0;

    function layout3d() {
      var gap = Math.min(stage.clientWidth * .4, 290);
      vcards.forEach(function (c, i) {
        var d = i - active;
        var ad = Math.abs(d);
        c.style.transform =
          'translateX(' + (d * gap) + 'px) translateZ(' + (-ad * 250) + 'px) ' +
          'rotateY(' + (-d * 26) + 'deg) scale(' + (1 - ad * .07) + ')';
        c.style.opacity = ad > 2 ? 0 : (ad === 0 ? 1 : ad === 1 ? .5 : .18);
        c.style.zIndex = String(50 - ad);
        c.style.pointerEvents = ad === 0 ? 'auto' : 'none';
      });
      dots.forEach(function (d, i) { d.classList.toggle('is-on', i === active); });
    }
    function go(n) { active = (n + vcards.length) % vcards.length; layout3d(); }
    layout3d();

    var vNext = $('#vNext'), vPrev = $('#vPrev');
    if (vNext) vNext.addEventListener('click', function () { go(active + 1); });
    if (vPrev) vPrev.addEventListener('click', function () { go(active - 1); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { go(i); }); });
    window.addEventListener('resize', layout3d);
    vcards.forEach(function (c, i) {
      c.addEventListener('mouseenter', function () { if (i !== active) go(i); });
    });

    var sx = null;
    stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 46) go(active + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });

    if (hasST && !reduced) {
      gsap.fromTo('.stage3d', { opacity: 0, y: 60 }, {
        opacity: 1, y: 0, duration: 1.1, ease: 'expo.out',
        scrollTrigger: { trigger: '.stage3d', start: 'top 84%' }
      });
    }
  }

    /* ========================================================================
     18 · GALLERY  -  snap scroll rail
     ===================================================================== */
  var galRows = $$('.gallx__row');
  if (galRows.length) {
    galRows.forEach(function (row) {
      var dir = parseFloat(row.getAttribute('data-dir') || '1');
      var x = 0, half = 0, paused = false;
      function measure() { half = row.scrollWidth / 2; }
      measure();
      x = dir > 0 ? -half : 0;
      window.addEventListener('resize', function () { measure(); });
      row.addEventListener('mouseenter', function () { paused = true; });
      row.addEventListener('mouseleave', function () { paused = false; });
      (function step() {
        if (!reduced && half > 0 && !paused) {
          x += dir * (.32 + Math.min(2.2, Math.abs(scrollVelocity) / 26));
          if (dir > 0) { if (x >= 0) x -= half; }
          else { if (x <= -half) x += half; }
          row.style.transform = 'translate3d(' + x + 'px,0,0)';
        }
        requestAnimationFrame(step);
      })();
    });
  }

/* ========================================================================
     19 · BOOKING FORM
     ===================================================================== */
  $$('.field').forEach(function (f) {
    var input = f.querySelector('input, select');
    if (!input) return;
    function sync() { f.classList.toggle('has-val', !!input.value); }
    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    input.addEventListener('blur', sync);
    sync();
  });

  function pickOne(list, cls, sel) {
    list.forEach(function (b) {
      b.addEventListener('click', function () {
        list.forEach(function (o) { o.classList.remove(cls); });
        b.classList.add(cls);
      });
    });
  }
  pickOne($$('.day'), 'is-on');
  pickOne($$('.slot'), 'is-on');

  var bookForm = $('#bookForm');
  if (bookForm) {
    var bookMsg = $('#bookMsg');
    var bookName = bookForm.querySelector('[name="name"]');
    var bookEmail = bookForm.querySelector('[name="email"]');
    var bookPhone = bookForm.querySelector('[name="phone"]');
    var bookService = bookForm.querySelector('[name="service"]');
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    var PHONE_RE = /^[6-9]\d{9}$/;
    function cleanPhone(v) {
      var d = String(v || '').replace(/[^0-9]/g, '');
      return d.length > 10 && /^(91|0)/.test(d) ? d.slice(2) : d;
    }
    function fieldBox(input) {
      if (!input) return null;
      if (input.closest) return input.closest('.field, .days, .slots');
      return input.parentNode;
    }
    function setError(box, msg) {
      if (!box) return;
      var p = box.querySelector('.bookx__ferr');
      if (p) {
        var s = p.querySelector('span');
        if (s) s.textContent = msg || '';
      }
      box.classList.toggle('has-err', !!msg);
    }
    function validate() {
      var errors = [];

      var nameV = bookName ? String(bookName.value || '').trim() : '';
      var nameMsg = '';
      if (!nameV) nameMsg = 'Please enter your full name.';
      else if (!/^[A-Za-z ]+$/.test(nameV)) nameMsg = 'Please enter your name using letters only.';
      setError(fieldBox(bookName), nameMsg);
      if (nameMsg) errors.push(nameMsg);

      var emailV = bookEmail ? String(bookEmail.value || '').trim() : '';
      var emailMsg = '';
      if (!emailV) emailMsg = 'Please enter your email address.';
      else if (!EMAIL_RE.test(emailV)) emailMsg = 'Please enter a valid email address.';
      setError(fieldBox(bookEmail), emailMsg);
      if (emailMsg) errors.push(emailMsg);

      var phoneV = bookPhone ? String(bookPhone.value || '').trim() : '';
      var phoneMsg = '';
      if (!phoneV) phoneMsg = 'Please enter your mobile number.';
      else if (!PHONE_RE.test(cleanPhone(phoneV))) phoneMsg = 'Please enter a valid 10-digit Indian mobile number.';
      setError(fieldBox(bookPhone), phoneMsg);
      if (phoneMsg) errors.push(phoneMsg);

      var svcV = bookService ? String(bookService.value || '').trim() : '';
      var svcMsg = svcV ? '' : 'Please select a department.';
      setError(fieldBox(bookService), svcMsg);
      if (svcMsg) errors.push(svcMsg);

      var daySet = $('.days', bookForm) || $('.days');
      var slotSet = $('.slots', bookForm) || $('.slots');
      var dayOk = !!$('.day.is-on');
      var slotOk = !!$('.slot.is-on');
      var dayMsg = dayOk ? '' : 'Please select a preferred day.';
      var slotMsg = slotOk ? '' : 'Please select a preferred time.';
      setError(daySet, dayMsg);
      setError(slotSet, slotMsg);
      if (dayMsg) errors.push(dayMsg);
      if (slotMsg) errors.push(slotMsg);

      return errors;
    }

    if (bookName) bookName.addEventListener('input', function () { setError(fieldBox(bookName), ''); });
    if (bookEmail) bookEmail.addEventListener('input', function () { setError(fieldBox(bookEmail), ''); });
    if (bookPhone) bookPhone.addEventListener('input', function () {
      var d = bookPhone.value.replace(/[^0-9]/g, '').slice(0, 10);
      var v = d.replace(/^(\d{5})(\d{1,5})$/, '$1 $2');
      if (v !== bookPhone.value) bookPhone.value = v;
      setError(fieldBox(bookPhone), '');
    });
    if (bookService) bookService.addEventListener('change', function () { setError(fieldBox(bookService), ''); });
    $$('.day').forEach(function (b) {
      b.addEventListener('click', function () { setError($('.days', bookForm) || $('.days'), ''); });
    });
    $$('.slot').forEach(function (b) {
      b.addEventListener('click', function () { setError($('.slots', bookForm) || $('.slots'), ''); });
    });

    bookForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var errs = validate();
      if (bookMsg) { bookMsg.textContent = ''; bookMsg.classList.remove('is-err'); }
      if (errs.length) {
        var firstBox = bookForm.querySelector('.has-err');
        if (firstBox) {
          var focusable = firstBox.matches('input, select, textarea') ? firstBox : firstBox.querySelector('input, select, textarea, button');
          if (focusable && focusable.focus) focusable.focus();
        }
        if (!reduced && hasGSAP) gsap.fromTo(bookForm.querySelectorAll('.has-err'), { x: -7 }, { x: 0, duration: .5, ease: 'elastic.out(1,.35)' });
        return;
      }
      window.location.href = page404();
    });
  }

  /* appointment console - live summary + service preview */
  var svcPick = $('#svcPick');
  var svcSelect = bookForm ? bookForm.querySelector('[name="service"]') : null;
  var sumDay = $('#sumDay');
  var sumTime = $('#sumTime');
  var sumService = $('#sumService');
  var preview = $('#bookxPreview');
  var SVC_IMG = {
    'Comprehensive Eye Examination': 'Images/svc-1.webp',
    'LASIK & Refractive Surgery': 'Images/svc-2.webp',
    'Lens & Frame Architecture': 'Images/svc-3.webp',
    'Contact Lens Fitting': 'Images/svc-4.webp',
    'Paediatric Vision Care': 'Images/svc-5.webp',
    'Retina & Glaucoma Care': 'Images/svc-6.webp'
  };
  function previewTo(src) {
    if (!preview || !src) return;
    var img = preview.querySelector('img');
    if (!img || img.getAttribute('src') === src) return;
    preview.classList.add('is-swap');
    setTimeout(function () { img.setAttribute('src', src); preview.classList.remove('is-swap'); }, 260);
  }
  function flashChips() {
    $$('.bookx__chip').forEach(function (c) { c.classList.add('is-live'); });
    clearTimeout(flashChips._t);
    flashChips._t = setTimeout(function () {
      $$('.bookx__chip').forEach(function (c) { c.classList.remove('is-live'); });
    }, 1400);
  }
  function syncSummary() {
    var d = $('.day.is-on');
    var sl = $('.slot.is-on');
    if (sumDay && d) {
      sumDay.textContent = (d.querySelector('b') ? d.querySelector('b').textContent : '') + ' ' +
        (d.querySelector('em') ? d.querySelector('em').textContent : '');
    }
    if (sumTime && sl) sumTime.textContent = sl.textContent.trim();
  }
  function setService(name, label) {
    if (svcSelect && name) {
      for (var i = 0; i < svcSelect.options.length; i++) {
        if (svcSelect.options[i].textContent.trim() === name || svcSelect.options[i].value === name) {
          svcSelect.selectedIndex = i;
          break;
        }
      }
      if (svcSelect.parentNode) svcSelect.parentNode.classList.add('has-val');
    }
    if (sumService && label) sumService.textContent = label;
    previewTo(SVC_IMG[name]);
  }
  if (svcPick) {
    var spicks = $$('.spick', svcPick);
    spicks.forEach(function (b) {
      b.addEventListener('click', function () {
        spicks.forEach(function (x) { x.classList.remove('is-on'); });
        b.classList.add('is-on');
        var label = b.querySelector('span') ? b.querySelector('span').textContent : b.textContent.trim();
        setService(b.getAttribute('data-svc'), label);
        flashChips();
      });
    });
    var onPill = $('.spick.is-on', svcPick);
    if (onPill) setService(onPill.getAttribute('data-svc'), onPill.querySelector('span') ? onPill.querySelector('span').textContent : '');
  }
  if (svcSelect) svcSelect.addEventListener('change', function () {
    var v = svcSelect.value;
    if (svcPick) $$('.spick', svcPick).forEach(function (x) { x.classList.toggle('is-on', x.getAttribute('data-svc') === v); });
    previewTo(SVC_IMG[v]);
    if (sumService && v) sumService.textContent = v.split(' ')[0].replace(/&/g, '').trim();
  });
  $$('.day').forEach(function (d) { d.addEventListener('click', function () { syncSummary(); flashChips(); }); });
  $$('.slot').forEach(function (s) { s.addEventListener('click', function () { syncSummary(); flashChips(); }); });
  syncSummary();

  var nlForm = $('#nlForm');
  if (nlForm) {
    nlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nlForm.querySelector('input');
      var msg = $('#nlMsg');
      var email = input ? input.value.trim() : '';
      var ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      if (!ok) {
        if (msg) {
          msg.textContent = 'Please enter a valid email address.';
          msg.classList.add('is-err');
          msg.classList.remove('is-ok');
        }
        if (hasGSAP && !reduced) gsap.fromTo(nlForm, { x: -6 }, { x: 0, duration: .5, ease: 'elastic.out(1,.3)' });
        return;
      }
      window.location.href = page404();
    });
  }

  /* ========================================================================
     20 · FOOTER
     ===================================================================== */
  var yr = $('#yr');
  if (yr) yr.textContent = String(new Date().getFullYear());

  if (hasST && !reduced) {
    gsap.fromTo('.ftr__eyeshape img', { scale: 1.45, xPercent: -6 }, {
      scale: 1.12, xPercent: 0, ease: 'none',
      scrollTrigger: { trigger: '.ftr__eyeshape', start: 'top bottom', end: 'bottom top', scrub: true }
    });
    gsap.fromTo($$('.ftr__col'), { y: 44, opacity: 0 }, {
      y: 0, opacity: 1, duration: .9, stagger: .1, ease: 'expo.out',
      scrollTrigger: { trigger: '.ftr__grid', start: 'top 88%' }
    });
  }

  /* ========================================================================
     21 · GLOBAL REFRESH
     ===================================================================== */
  if (hasST) {
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { ScrollTrigger.refresh(); }, 260);
    });
  }

  /* failsafe: never leave the page locked behind the preloader */
  setTimeout(function () {
    if (preloader && preloader.style.display !== 'none' && !loaderDone) exitLoader();
    document.body.classList.remove('is-locked');
  }, 13000);
})();
