/* ==========================================================================
   STACKLY — EYE CARE CLINIC
   Authentication behaviour  ·  auth.js
   Shared by login.html and signup.html.
   Pure vanilla — validation, password strength, show/hide, remember email.
   ========================================================================== */
(function () {
  'use strict';

  function $(s, c) { return (c || document).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var NAME_RE  = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/;

  /* ---------------------------------------------------------------- helpers */
  function wrapOf(input) { return input ? input.closest('.af') : null; }

  function setField(input, ok, message) {
    var wrap = wrapOf(input);
    if (!wrap) return ok;
    wrap.classList.toggle('is-bad', !ok);
    wrap.classList.toggle('is-ok', ok);
    var slot = wrap.querySelector('.af__err span');
    if (slot) slot.textContent = ok ? '' : (message || '');
    return ok;
  }

  function clearField(input) {
    var wrap = wrapOf(input);
    if (!wrap) return;
    wrap.classList.remove('is-bad', 'is-ok');
    var slot = wrap.querySelector('.af__err span');
    if (slot) slot.textContent = '';
  }

  function shake(el) {
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    el.classList.remove('shake');
    void el.offsetWidth;
    el.classList.add('shake');
    setTimeout(function () { el.classList.remove('shake'); }, 520);
  }

  function setNote(el, message, isErr) {
    if (!el) return;
    el.textContent = message || '';
    el.classList.toggle('is-err', !!isErr);
  }

  /* -------------------------------------------------- password show / hide */
  $$('[data-toggle]').forEach(function (btn) {
    var input = document.getElementById(btn.getAttribute('data-toggle'));
    if (!input) return;
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      var icon = btn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-eye', !show);
        icon.classList.toggle('fa-eye-slash', show);
      }
      if (btn.classList.contains('af__eye')) {
        btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
      }
      input.focus();
    });
  });

  /* ------------------------------------------------------ password strength */
  function pwChecks(v) {
    return {
      len: v.length >= 8,
      upper: /[A-Z]/.test(v),
      lower: /[a-z]/.test(v),
      number: /\d/.test(v),
      special: /[^A-Za-z0-9]/.test(v)
    };
  }
  function pwPassing(c) { return c.len && c.upper && c.lower && c.number && c.special; }
  function pwLevel(c) {
    var n = ['len', 'upper', 'lower', 'number', 'special']
      .reduce(function (sum, k) { return sum + (c[k] ? 1 : 0); }, 0);
    return Math.min(4, n);
  }
  var PW_LABELS = ['Strength', 'Weak', 'Fair', 'Good', 'Strong'];

  function wireStrength(input, meter, reqs) {
    if (!input) return { checks: function () { return pwChecks(input ? input.value : ''); }, refresh: function () {} };
    function refresh() {
      var v = input.value;
      var c = pwChecks(v);
      var level = v ? pwLevel(c) : 0;
      if (meter) meter.setAttribute('data-level', String(level));
      var label = meter ? meter.querySelector('.auth-pw__label') : null;
      if (label) label.textContent = v ? PW_LABELS[level] : 'Strength';
      if (reqs) {
        $$('li', reqs).forEach(function (li) {
          li.classList.toggle('is-ok', !!c[li.getAttribute('data-req')]);
        });
      }
    }
    input.addEventListener('input', refresh);
    refresh();
    return { checks: function () { return pwChecks(input.value); }, refresh: refresh };
  }

  /* clear an error as soon as the visitor starts fixing the field */
  function bindClear(input) {
    if (!input) return;
    var evt = input.tagName === 'SELECT' ? 'change' : 'input';
    input.addEventListener(evt, function () { clearField(input); });
  }

  /* =========================================================================
     LOGIN
     ========================================================================= */
  var loginForm = $('#loginForm');
  if (loginForm) {
    var lEmail = $('#loginEmail');
    var lPass = $('#loginPassword');
    var lRole = $('#loginRole');
    var lRemember = $('#rememberMail');
    var lNote = $('#loginNote');
    var lSubmit = $('#loginSubmit');

    [lEmail, lPass, lRole].forEach(bindClear);

    var vLoginEmail = function () {
      var v = (lEmail.value || '').trim();
      if (!v) return setField(lEmail, false, 'Email address is required.');
      if (!EMAIL_RE.test(v)) return setField(lEmail, false, 'Enter a valid email address (name@domain.com).');
      return setField(lEmail, true);
    };
    var vLoginPass = function () {
      var v = lPass.value || '';
      if (!v) return setField(lPass, false, 'Password is required.');
      if (v.length < 8) return setField(lPass, false, 'Password must be at least 8 characters.');
      return setField(lPass, true);
    };
    var vLoginRole = function () {
      if (!lRole.value) return setField(lRole, false, 'Please select a role to continue.');
      return setField(lRole, true);
    };

    lEmail.addEventListener('blur', vLoginEmail);
    lPass.addEventListener('blur', vLoginPass);
    lRole.addEventListener('change', vLoginRole);

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      setNote(lNote, '');

      var okEmail = vLoginEmail();
      var okPass = vLoginPass();
      var okRole = vLoginRole();
      var ok = okEmail && okPass && okRole;

      if (!ok) {
        var firstBad = loginForm.querySelector('.af.is-bad');
        shake(firstBad);
        setNote(lNote, 'Please correct the highlighted fields and try again.', true);
        return;
      }

      if (lSubmit) { lSubmit.classList.add('is-busy'); }
      setNote(lNote, 'Verifying your details…', false);

      window.setTimeout(function () {
        if (lSubmit) { lSubmit.classList.remove('is-busy'); lSubmit.classList.add('is-done'); }
        setNote(lNote, 'Welcome back — signing you in…', false);
        var role = (lRole.value || 'optometrist');
        var email = (lEmail.value || '').trim();
        var name = (email.split('@')[0] || 'there').replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
        try {
          window.localStorage.setItem('stackly_user', JSON.stringify({ name: name, email: email, role: role }));
        } catch (e) {}
        var dest = (role === 'administrator') ? 'Administrator/index.html' : 'Optometrist/index.html';
        window.setTimeout(function () { window.location.href = dest; }, 700);
      }, 850);
    });

    /* forgot password — placeholder redirect */
    var forgot = $('#forgotLink');
    if (forgot) {
      forgot.addEventListener('click', function (e) {
        e.preventDefault();
        window.location.href = '404.html';
      });
    }

    /* google (demo) */
    var lGoogle = $('#loginGoogle');
    if (lGoogle) {
      lGoogle.addEventListener('click', function () {
        window.location.href = '404.html';
      });
    }
  }

  /* =========================================================================
     SIGNUP
     ========================================================================= */
  var signupForm = $('#signupForm');
  if (signupForm) {
    var sName = $('#signupName');
    var sEmail = $('#signupEmail');
    var sPass = $('#signupPassword');
    var sConfirm = $('#signupConfirm');
    var sRole = $('#signupRole');
    var sNote = $('#signupNote');
    var sSubmit = $('#signupSubmit');
    var lTerms = $('.lg_terms .acheck');
    var lTermsInput = lTerms ? lTerms.querySelector('input') : null;
    var lTermsWrap = $('.lg_terms');

    wireStrength(sPass, $('#pwMeter'), $('#pwReqs'));

    [sName, sEmail, sPass, sConfirm, sRole].forEach(bindClear);

    var vName = function () {
      var v = (sName.value || '').trim();
      if (!v) return setField(sName, false, 'Full name is required.');
      if (!NAME_RE.test(v)) return setField(sName, false, 'Use letters only — no numbers or symbols.');
      return setField(sName, true);
    };
    var vEmail = function () {
      var v = (sEmail.value || '').trim();
      if (!v) return setField(sEmail, false, 'Email address is required.');
      if (!EMAIL_RE.test(v)) return setField(sEmail, false, 'Enter a valid email address (name@domain.com).');
      return setField(sEmail, true);
    };
    var vPass = function () {
      var c = pwChecks(sPass.value || '');
      if (!sPass.value) return setField(sPass, false, 'Create a password.');
      if (!pwPassing(c)) return setField(sPass, false, 'Password does not meet all the requirements below.');
      return setField(sPass, true);
    };
    var vConfirm = function () {
      if (!sConfirm.value) return setField(sConfirm, false, 'Please confirm your password.');
      if (sConfirm.value !== sPass.value) return setField(sConfirm, false, 'Passwords do not match.');
      return setField(sConfirm, true);
    };
    var vRole = function () {
      if (!sRole.value) return setField(sRole, false, 'Please select a role.');
      return setField(sRole, true);
    };
    var vTerms = function () {
      var ok = !!(lTermsInput && lTermsInput.checked);
      if (lTermsWrap) {
        lTermsWrap.classList.toggle('is-bad', !ok);
        var slot = lTermsWrap.querySelector('.lg_terms__err span');
        if (slot) slot.textContent = ok ? '' : 'Please accept the Terms and Privacy Policy to continue.';
      }
      return ok;
    };

    sName.addEventListener('blur', vName);
    sEmail.addEventListener('blur', vEmail);
    sPass.addEventListener('blur', vPass);
    sConfirm.addEventListener('blur', vConfirm);
    sRole.addEventListener('change', vRole);

    /* keep confirm reactive */
    signupForm.addEventListener('input', function () {
      if (sConfirm.value && sConfirm.value === sPass.value) clearField(sConfirm);
    });
    if (lTermsInput) {
      lTermsInput.addEventListener('change', function () {
        if (this.checked && lTermsWrap) {
          lTermsWrap.classList.remove('is-bad');
          var slot = lTermsWrap.querySelector('.lg_terms__err span');
          if (slot) slot.textContent = '';
        }
      });
    }

    signupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      setNote(sNote, '');

      var okName = vName();
      var okEmail = vEmail();
      var okPass = vPass();
      var okConfirm = vConfirm();
      var okRole = vRole();
      var okTerms = vTerms();
      var ok = okName && okEmail && okPass && okConfirm && okRole && okTerms;

      if (!ok) {
        var fieldBad = signupForm.querySelector('.af.is-bad');
        shake(fieldBad || (okTerms ? null : lTermsWrap));
        setNote(sNote, fieldBad
          ? 'Please fix the highlighted fields before creating your account.'
          : '', !!fieldBad);
        return;
      }

      if (sSubmit) sSubmit.classList.add('is-busy');
      setNote(sNote, 'Creating your account…', false);

      window.setTimeout(function () {
        if (sSubmit) { sSubmit.classList.remove('is-busy'); sSubmit.classList.add('is-done'); }
        setNote(sNote, 'Account created — taking you to sign in…', false);
        window.setTimeout(function () { window.location.href = 'login.html'; }, 850);
      }, 950);
    });

    var signupGoogle = $('#signupGoogle');
    if (signupGoogle) signupGoogle.addEventListener('click', function () {
      window.location.href = '404.html';
    });
  }
})();