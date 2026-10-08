/* ==========================================================================
   STACKLY — EYE CARE CLINIC
   Contact Page behaviour  ·  contact.js
   --------------------------------------------------------------------------
   Loaded AFTER home.js. Drives the ten original contact sections only.
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

  /* run once when an element scrolls into view ------------------------------ */
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
       01 · HERO — OPEN CHANNEL
       ================================================================ */
    var hero = $('#ctcHero');
    if (hero) {
      var words = $$('.ctc-hero__title .ctc-w', hero);
      var visual = $('.ctc-hero__visual', hero);
      var frame = $('.ctc-hero__frame', hero);

      if (startOK) {
        gsap.set(words, { yPercent: 120, opacity: 0 });
        gsap.set('.ctc-hero__sub, .ctc-hero__meta, .ctc-hero__status', { opacity: 0, y: 18 });
        gsap.set('.ctc-hero__acts .ctc-chip', { opacity: 0, y: 18 });
        gsap.set('.ctc-hero__frame', { opacity: 0, scale: .94 });
        gsap.set('.ctc-float', { opacity: 0, y: 22 });

        afterPreloader(function () {
          gsap.timeline({ defaults: { ease: 'expo.out' } })
            .fromTo(words, { yPercent: 120, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1, stagger: .09 }, .1)
            .to('.ctc-hero__sub', { opacity: 1, y: 0, duration: .7 }, .5)
            .to('.ctc-hero__acts .ctc-chip', { opacity: 1, y: 0, duration: .7, stagger: .1 }, .6)
            .to('.ctc-hero__meta', { opacity: 1, y: 0, duration: .7 }, .78)
            .to('.ctc-hero__status', { opacity: 1, y: 0, duration: .7 }, .82)
            .to('.ctc-hero__frame', { opacity: 1, scale: 1, duration: 1.1, clearProps: 'transform,opacity' }, .3)
            .to('.ctc-float', { opacity: 1, y: 0, duration: .8, stagger: .14, clearProps: 'transform,opacity' }, .8);
        });

        gsap.to('.ctc-hero__visual', {
          yPercent: 8, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true }
        });
      }

      /* 3D pointer tilt on the visual */
      if (visual && frame && !isTouch && startOK) {
        visual.addEventListener('pointermove', function (e) {
          var r = visual.getBoundingClientRect();
          var mx = (e.clientX - r.left) / r.width - .5;
          var my = (e.clientY - r.top) / r.height - .5;
          gsap.to(frame, { rotateY: mx * 9, rotateX: -my * 9, transformPerspective: 900, duration: .6, ease: 'power3.out' });
gsap.to('.ctc-float--a', { x: mx * 16, y: my * 16, duration: .8, ease: 'power3.out' });
        gsap.to('.ctc-float--b', { x: mx * -16, y: my * -16, duration: .8, ease: 'power3.out' });
        });
        visual.addEventListener('pointerleave', function () {
          gsap.to(frame, { rotateX: 0, rotateY: 0, duration: .7, ease: 'power3.out' });
          gsap.to('.ctc-float', { x: 0, y: 0, duration: .7, ease: 'power3.out' });
        });
      }
    }

    /* ================================================================
       02 · CHANNELS
       ================================================================ */
    if ($('.ctc-chan__grid') && startOK) {
      gsap.from('.ctc-chan', {
        opacity: 0, y: 40, duration: .8, stagger: .12, ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.ctc-chan__grid', start: 'top 82%', once: true }
      });
    }

    /* ================================================================
       03 · MAP
       ================================================================ */
    var mapShell = $('.ctc-map__shell');
    if (mapShell && startOK) {
      gsap.from(mapShell, {
        opacity: 0, y: 40, scale: .98, duration: 1, ease: 'expo.out',
        scrollTrigger: { trigger: mapShell, start: 'top 84%', once: true }
      });
      gsap.from('.ctc-map__card', {
        opacity: 0, x: -30, duration: .8, ease: 'expo.out', delay: .35,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: mapShell, start: 'top 70%', once: true }
      });
    }

    /* ================================================================
       04 · LOCATIONS
       ================================================================ */
    if ($('.ctc-loc__grid') && startOK) {
      gsap.from('.ctc-loc__tile', {
        opacity: 0, y: 34, scale: .96, duration: .7, stagger: .1, ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.ctc-loc__grid', start: 'top 84%', once: true }
      });
    }

    /* ================================================================
       05 · FORM
       ================================================================ */
    var formBlock = $('.ctc-form');
    if (formBlock && startOK) {
      gsap.from('.ctc-form__aside', {
        opacity: 0, y: 30, duration: .8, ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.ctc-form__in', start: 'top 80%', once: true }
      });
      gsap.from('.ctc-field', {
        opacity: 0, y: 22, duration: .6, stagger: .08, ease: 'expo.out',
        scrollTrigger: { trigger: '.ctc-form__fields', start: 'top 85%', once: true }
      });
    }
    if (formBlock) {
      formBlock.classList.add('is-armed');
      onceInView(formBlock, function () { formBlock.classList.add('is-in'); }, { threshold: 0.2 });
    }
    var theForm = $('#ctcForm');
    if (theForm) {
      var sendBtn = $('.ctc-send', theForm);
      var NAME_RE = /^[A-Za-z ]+$/;
      var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      var PHONE_RE = /^[6-9]\d{9}$/;
      function ctc404() { return /\/HTML\//i.test(window.location.pathname) ? '404.html' : 'HTML/404.html'; }
      function cleanPhone(v) {
        var d = String(v || '').replace(/[^0-9]/g, '');
        return d.length > 10 && /^(91|0)/.test(d) ? d.slice(2) : d;
      }
      function setField(f, hasErr, text) {
        if (!f) return;
        var wrap = f.closest('.ctc-field');
        if (wrap) wrap.classList.toggle('is-bad', hasErr);
        var err = wrap ? $('.ctc-field__err', wrap) : null;
        var span = err ? $('span', err) : null;
        if (span) span.textContent = text || '';
      }
      var nameIn = $('input[name="name"]', theForm);
      var emailIn = $('input[name="email"]', theForm);
      var phoneIn = $('input[name="phone"]', theForm);
      var subjectIn = $('select[name="subject"]', theForm);
      var msgIn = $('textarea[name="message"]', theForm);
      var rules = [
        {
          f: nameIn,
          test: function (v) {
            if (!v.trim()) return 'Please enter your name.';
            if (!NAME_RE.test(v.trim()) || !/[A-Za-z]/.test(v)) return 'Please enter your name using letters only.';
            return '';
          }
        },
        {
          f: emailIn,
          test: function (v) {
            if (!v.trim()) return 'Please enter your email address.';
            if (!EMAIL_RE.test(v.trim())) return 'Enter a valid email address.';
            return '';
          }
        },
        {
          f: phoneIn,
          test: function (v) {
            if (!v.trim()) return 'Please enter your mobile number.';
            if (!PHONE_RE.test(cleanPhone(v))) return 'Please enter a valid 10-digit Indian mobile number.';
            return '';
          }
        },
        {
          f: subjectIn,
          test: function (v) { return v ? '' : 'Please select a topic.'; }
        },
        {
          f: msgIn,
          test: function (v) { return v.trim() ? '' : 'Please enter your message.'; }
        }
      ];
      rules.forEach(function (r) {
        if (!r.f) return;
        var evt = r.f.tagName === 'SELECT' ? 'change' : 'input';
        r.f.addEventListener(evt, function () {
          if (r.f.closest('.ctc-field') && r.f.closest('.ctc-field').classList.contains('is-bad')) {
            var msg = r.test(r.f.value);
            if (!msg) setField(r.f, false, '');
          }
        });
      });
      theForm.addEventListener('submit', function (e) {
        e.preventDefault();
        if (sendBtn && hasGSAP && !reduced) {
          gsap.fromTo(sendBtn, { scale: 1 }, { scale: .96, duration: .12, yoyo: true, repeat: 1 });
        }
        var firstBad = null;
        rules.forEach(function (r) {
          if (!r.f) return;
          var msg = r.test(r.f.value);
          setField(r.f, !!msg, msg);
          if (msg && !firstBad) firstBad = r.f;
        });
        if (firstBad) {
          if (firstBad.focus) firstBad.focus();
          return;
        }
        window.location.href = ctc404();
      });
    }

    /* ================================================================
       05 · DEPARTMENTS — TABS
       ================================================================ */
    var tabs = $$('.ctc-tab');
    var deptImgs = $$('.ctc-dept__view img');
    if (tabs.length) {
      var cap = $('.ctc-dept__cap');
      var capTitle = cap ? $('h3', cap) : null;
      var capDesc = cap ? $('p', cap) : null;

      var activate = function (i) {
        tabs.forEach(function (t, ti) { t.classList.toggle('is-on', ti === i); });
        deptImgs.forEach(function (img, ii) { img.classList.toggle('is-on', ii === i); });
        var t = tabs[i];
        if (t && capTitle && capDesc) {
          var title = t.getAttribute('data-title') || '';
          var desc = t.getAttribute('data-desc') || '';
          if (startOK) {
            gsap.timeline()
              .to([capTitle, capDesc], { opacity: 0, y: 10, duration: .2, ease: 'power2.in' })
              .add(function () { capTitle.textContent = title; capDesc.textContent = desc; })
              .fromTo([capTitle, capDesc], { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .4, ease: 'expo.out', stagger: .06 });
          } else {
            capTitle.textContent = title;
            capDesc.textContent = desc;
          }
        }
      };

      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { activate(i); });
        t.setAttribute('role', 'button');
        t.setAttribute('tabindex', '0');
        t.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(i); }
        });
      });

      if (startOK) {
        gsap.from('.ctc-tab', {
          opacity: 0, x: -24, duration: .6, stagger: .08, ease: 'expo.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: '.ctc-tabs', start: 'top 84%', once: true }
        });
        gsap.from('.ctc-dept__view', {
          opacity: 0, scale: .96, duration: .9, ease: 'expo.out',
          scrollTrigger: { trigger: '.ctc-dept__view', start: 'top 84%', once: true }
        });
      }
    }

    /* ================================================================
       06 · FAQ — HORIZONTAL ACCORDION
       ================================================================ */
    var faqPanels = $$('.ctc-faq__panel');
    if (faqPanels.length) {
      faqPanels.forEach(function (p) {
        p.addEventListener('click', function () {
          var wasOn = p.classList.contains('is-on');
          faqPanels.forEach(function (o) { o.classList.remove('is-on'); });
          if (!wasOn) p.classList.add('is-on');
        });
        p.setAttribute('role', 'button');
        p.setAttribute('tabindex', '0');
        p.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.click(); }
        });
      });
      if (startOK) {
        gsap.from('.ctc-faq__panel', {
          opacity: 0, y: 34, duration: .7, stagger: .1, ease: 'expo.out',
          scrollTrigger: { trigger: '.ctc-faq__rail', start: 'top 84%', once: true }
        });
      }
    }

    /* ================================================================
       07 · HOURS — CLOCK DIAL
       ================================================================ */
    var dial = $('.ctc-dial');
    if (dial) {
      var hH = $('.ctc-dial__hand--h', dial);
      var hM = $('.ctc-dial__hand--m', dial);
      var hS = $('.ctc-dial__hand--s', dial);
      var setHands = function () {
        var now = new Date();
        var s = now.getSeconds(), m = now.getMinutes(), h = now.getHours() % 12;
        if (hH) hH.style.transform = 'rotate(' + (h * 30 + m * .5) + 'deg)';
        if (hM) hM.style.transform = 'rotate(' + (m * 6 + s * .1) + 'deg)';
        if (hS) hS.style.transform = 'rotate(' + (s * 6) + 'deg)';
      };
      setHands();
      if (hS && !reduced) setInterval(setHands, 1000);

      var arc = $('.ctc-dial__arc', dial);
      var list = $('.ctc-hours__list');
      if (list && arc) {
        $$('.ctc-hours__row', list).forEach(function (row) {
          row.addEventListener('mouseenter', function () {
            var a = parseFloat(row.getAttribute('data-angle'));
            if (isNaN(a)) a = 0;
            arc.style.transform = 'rotate(' + a + 'deg)';
            arc.style.opacity = '1';
          });
        });
        list.addEventListener('mouseleave', function () { arc.style.opacity = '0'; });
      }

      if (startOK) {
        gsap.from(dial, {
          opacity: 0, scale: .9, duration: 1, ease: 'expo.out',
          scrollTrigger: { trigger: '.ctc-hours', start: 'top 80%', once: true }
        });
        gsap.to('.ctc-dial__ticks', {
          rotate: 32, ease: 'none',
          scrollTrigger: { trigger: '.ctc-hours', start: 'top bottom', end: 'bottom top', scrub: true }
        });
        gsap.from('.ctc-hours__row', {
          opacity: 0, x: 26, duration: .6, stagger: .09, ease: 'expo.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: list, start: 'top 84%', once: true }
        });
      }
    }

    /* ================================================================
       08 · SOCIAL — STAMP WALL
       ================================================================ */
    if ($('.ctc-stamps') && startOK) {
      gsap.from('.ctc-stamp', {
        opacity: 0, scale: .7, rotate: 0, duration: .7, stagger: .1, ease: 'back.out(1.5)',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.ctc-stamps', start: 'top 84%', once: true }
      });
    }

    /* ================================================================
       09 · TICKET — CLOSING CTA
       ================================================================ */
    var ticket = $('.ctc-ticket');
    if (ticket && startOK) {
      gsap.from('.ctc-ticket', {
        opacity: 0, y: 40, rotate: -1.5, duration: 1, ease: 'expo.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.ctc-ticket-sec', start: 'top 82%', once: true }
      });
      gsap.from('.ctc-ticket__stub', {
        opacity: 0, x: 26, duration: .8, ease: 'expo.out', delay: .15,
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: '.ctc-ticket', start: 'top 80%', once: true }
      });
    }

    /* refresh once everything (fonts / images) has settled */
    window.addEventListener('load', function () { if (hasST) ScrollTrigger.refresh(); });

  });
})();