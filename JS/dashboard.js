/* ==========================================================================
   STACKLY — EYE CARE CLINIC
   Role dashboards script  ·  dashboard.js
   Shared by HTML/Optometrist/index.html and HTML/Administrator/index.html
   --------------------------------------------------------------------------
   The page declares its role on <html data-dash-role="...">. This script:
     · guards the session (falls back to a demo user when opened directly)
     · renders the sidebar, topbar and role-specific views
     · drives the fullscreen mobile menu, search, logout and toasts
   Icons: Font Awesome only. No SVG, no emoji.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var win = window;
  var root = doc.documentElement;
  var pageRole = root.getAttribute('data-dash-role') || 'optometrist';

  /* ---------------------------------------------------------------- config */
  var USER_KEY = 'stackly_user';

  var DASH = {
    optometrist: '../Optometrist/index.html',
    administrator: '../Administrator/index.html'
  };

  var DEMO = {
    optometrist: { name: 'Dr. Avery Stone', email: 'avery.stone@stackly.clinic' },
    administrator: { name: 'Jordan Blake', email: 'jordan.blake@stackly.clinic' }
  };

  var ROLE_LABEL = {
    optometrist: 'Optometrist · Clinical',
    administrator: 'Clinic Administrator · Front desk'
  };

  var LOGIN_PAGE = '../login.html';
  var HOME_PAGE = '../../index.html';

  /* every placeholder action on both dashboards resolves to the 404 page,
     exactly as the reference dashboards behave */
  var DEAD = '../404.html';

  /* ------------------------------------------------------------- auth gate */
  function readUser() {
    try { return JSON.parse(win.localStorage.getItem(USER_KEY) || 'null'); }
    catch (e) { return null; }
  }

  var user = readUser();

  if (user && user.role && DASH[user.role] && user.role !== pageRole) {
    win.location.href = DASH[user.role];
    return;
  }
  if (!user) {
    user = { name: DEMO[pageRole].name, email: DEMO[pageRole].email, role: pageRole };
  }

  /* ============================================================== helpers */
  function esc(v) {
    return String(v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  var PILL = {
    Confirmed: 'ok', Reviewed: 'ok', Delivered: 'ok', Paid: 'ok', Active: 'ok', Complete: 'ok',
    Scheduled: 'ok', Completed: 'ok',
    Pending: 'warn', 'In progress': 'warn', 'Low stock': 'warn', 'Awaiting review': 'warn',
    'Due': 'warn', 'Draft': 'warn', 'Partial': 'warn',
    Cancelled: 'bad', Overdue: 'bad', Refunded: 'bad', 'No-show': 'bad', Referral: 'bad',
    'Out of stock': 'mute', Inactive: 'mute'
  };
  function pill(status) {
    return '<span class="pill pill--' + (PILL[status] || 'mute') + '">' + esc(status) + '</span>';
  }

  function hero(tag, icon, title, sub, action) {
    return '<section class="d-hero">' +
      '<div>' +
        '<p class="d-hero__tag"><i class="fa-solid ' + icon + '" aria-hidden="true"></i>' + esc(tag) + '</p>' +
        '<h3 class="d-hero__title">' + esc(title) + '</h3>' +
        '<p class="d-hero__sub">' + esc(sub) + '</p>' +
      '</div>' +
      (action ? '<a class="d-hero__act" href="' + DEAD + '"><i class="fa-solid ' + action.icon + '" aria-hidden="true"></i>' + esc(action.label) + '</a>' : '') +
    '</section>';
  }

  function stats(key) {
    var items = D.stats[key] || [];
    return '<div class="d-stats">' + items.map(function (it) {
      return '<div class="d-stat">' +
        '<span class="d-stat__ico"><i class="fa-solid ' + it.icon + '" aria-hidden="true"></i></span>' +
        '<div><strong class="d-stat__val">' + esc(it.val) + '</strong><span class="d-stat__lab">' + esc(it.lab) + '</span></div>' +
      '</div>';
    }).join('') + '</div>';
  }

  function panel(title, inner, action) {
    return '<section class="d-panel">' +
      '<div class="d-panel__head"><h3>' + esc(title) + '</h3>' +
        (action ? '<a class="d-panel__act" href="' + DEAD + '">' + esc(action.label) + '</a>' : '') +
      '</div>' + inner + '</section>';
  }

  function grid2(a, b) { return '<div class="d-grid d-grid--2">' + a + b + '</div>'; }
  function grid3(a, b, c) { return '<div class="d-grid d-grid--3">' + a + b + c + '</div>'; }

  function table(headers, rows) {
    return '<div class="d-table-wrap"><table class="d-table"><thead><tr>' +
      headers.map(function (h) { return '<th>' + esc(h) + '</th>'; }).join('') +
      '</tr></thead><tbody>' +
      rows.map(function (cells) {
        return '<tr>' + cells.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
      }).join('') +
      '</tbody></table></div>';
  }

  function prodCell(img, title, sub) {
    return '<div class="d-prod"><img src="' + esc(img) + '" alt="" />' +
      '<div><strong>' + esc(title) + '</strong><span>' + esc(sub) + '</span></div></div>';
  }

  function imgList(items) {
    return items.map(function (it) {
      return '<div class="d-row"><span class="d-row__ico d-row__ico--img"><img src="' + esc(it.img) + '" alt="" /></span>' +
        '<div><strong>' + esc(it.name) + '</strong><span>' + esc(it.sub) + '</span></div></div>';
    }).join('');
  }

  function feed(items) {
    return items.map(function (it) {
      return '<div class="d-row"><span class="d-row__ico"><i class="fa-solid ' + it.icon + '" aria-hidden="true"></i></span>' +
        '<div><strong>' + esc(it.text) + '</strong><span>' + esc(it.time) + '</span></div></div>';
    }).join('');
  }

  function todos(items) {
    return items.map(function (it) {
      return '<div class="d-todo' + (it.done ? ' is-done' : '') + '">' +
        '<i class="fa-solid ' + (it.done ? 'fa-circle-check' : 'fa-circle') + '" aria-hidden="true"></i>' +
        '<div><strong>' + esc(it.l) + '</strong><span>' + esc(it.s) + '</span></div></div>';
    }).join('');
  }

  function progress(rows) {
    return rows.map(function (r) {
      return '<div class="d-prog"><div class="d-prog__top"><span>' + esc(r.l) + '</span><span>' + r.v + '%</span></div>' +
        '<div class="d-track"><span class="d-fill" data-w="' + r.v + '"></span></div></div>';
    }).join('');
  }

  function chart(rows) {
    var max = rows.reduce(function (a, r) { return Math.max(a, r.v); }, 1);
    return '<div class="d-chart">' + rows.map(function (r) {
      return '<div class="d-chart__col"><span class="d-bar" data-h="' + Math.round(r.v / max * 150) + '"></span><span>' + esc(r.l) + '</span></div>';
    }).join('') + '</div>';
  }

  function quick(items) {
    return '<div class="d-quick">' + items.map(function (it) {
      return '<a href="' + DEAD + '"><i class="fa-solid ' + it.icon + '" aria-hidden="true"></i>' + esc(it.label) + '</a>';
    }).join('') + '</div>';
  }

  function tiles(items) {
    return '<div class="d-tiles">' + items.map(function (it) {
      return '<div class="d-tile"><span class="d-tile__top"><i class="fa-solid ' + it.icon + '" aria-hidden="true"></i>' + esc(it.k) + '</span>' +
        '<strong>' + esc(it.v) + '</strong><span>' + esc(it.n) + '</span></div>';
    }).join('') + '</div>';
  }

  function kv(rows) {
    return '<div class="d-kv">' + rows.map(function (r) {
      return '<div class="d-kv__row"><span>' + esc(r[0]) + '</span><strong>' + esc(r[1]) + '</strong></div>';
    }).join('') + '</div>';
  }

  function timeline(items) {
    return '<div class="d-timeline">' + items.map(function (it) {
      return '<div class="tl' + (it.done ? ' tl--done' : '') + '">' +
        '<span class="tl__dot"><i class="fa-solid ' + it.icon + '" aria-hidden="true"></i></span>' +
        '<div><strong>' + esc(it.l) + '</strong><span>' + esc(it.s) + '</span>' + (it.p ? '<p>' + esc(it.p) + '</p>' : '') + '</div></div>';
    }).join('') + '</div>';
  }

  function steps(items) {
    return '<div class="d-steps">' + items.map(function (it, i) {
      return '<div class="d-step"><span class="d-step__n">' + (i + 1 < 10 ? '0' : '') + (i + 1) + '</span>' +
        '<strong>' + esc(it.l) + '</strong><p>' + esc(it.p) + '</p></div>';
    }).join('') + '</div>';
  }

  function note(text, icon, tone) {
    return '<div class="d-note' + (tone ? ' d-note--' + tone : '') + '">' +
      '<i class="fa-solid ' + (icon || 'fa-circle-info') + '" aria-hidden="true"></i><span>' + esc(text) + '</span></div>';
  }

  function hbars(rows) {
    var max = rows.reduce(function (a, r) { return Math.max(a, r.v); }, 1);
    return '<div class="d-hbars">' + rows.map(function (r) {
      return '<div class="hbar"><div class="hbar__top"><span>' + esc(r.l) + '</span><strong>' + esc(r.s || (r.v + '%')) + '</strong></div>' +
        '<div class="hbar__track"><span class="hbar__fill" data-w="' + Math.round(r.v / max * 100) + '"></span></div></div>';
    }).join('') + '</div>';
  }

  /* ============================================================== menu ==== */
  var MENU = {
    optometrist: [
      { key: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
      { key: 'appointments', label: 'Appointments', icon: 'fa-calendar-check' },
      { key: 'patients', label: 'Patients', icon: 'fa-users' },
      { key: 'exams', label: 'Eye exams', icon: 'fa-eye' },
      { key: 'prescriptions', label: 'Prescriptions', icon: 'fa-file-prescription' },
      { key: 'messages', label: 'Messages', icon: 'fa-envelope' }
    ],
    administrator: [
      { key: 'overview', label: 'Overview', icon: 'fa-gauge-high' },
      { key: 'appointments', label: 'Appointments', icon: 'fa-calendar-check' },
      { key: 'patients', label: 'Patient registry', icon: 'fa-id-card' },
      { key: 'billing', label: 'Billing', icon: 'fa-file-invoice-dollar' },
      { key: 'inventory', label: 'Inventory', icon: 'fa-boxes-stacked' },
      { key: 'messages', label: 'Messages', icon: 'fa-envelope' }
    ]
  };

  /* ============================================================== data ==== */
  var A = '../../Images/';
  var DATA = {
    /* ------------------------------------------------------- OPTOMETRIST */
    optometrist: {
      stats: {
        overview: [
          { icon: 'fa-calendar-check', val: '12', lab: "Today's appointments" },
          { icon: 'fa-users', val: '3', lab: 'Patients waiting' },
          { icon: 'fa-clipboard-check', val: '5', lab: 'Follow-ups due' },
          { icon: 'fa-clock', val: '32m', lab: 'Avg. exam time' }
        ],
        appointments: [
          { icon: 'fa-calendar-day', val: '12', lab: 'Booked today' },
          { icon: 'fa-circle-check', val: '9', lab: 'Confirmed' },
          { icon: 'fa-hourglass-half', val: '3', lab: 'Awaiting confirm' },
          { icon: 'fa-user-xmark', val: '1', lab: 'Cancelled' }
        ],
        patients: [
          { icon: 'fa-users', val: '1,284', lab: 'Total patients' },
          { icon: 'fa-user-plus', val: '26', lab: 'New this week' },
          { icon: 'fa-clock-rotate-left', val: '41', lab: 'Due for review' },
          { icon: 'fa-triangle-exclamation', val: '7', lab: 'High-risk' }
        ],
        exams: [
          { icon: 'fa-eye', val: '8', lab: 'Completed today' },
          { icon: 'fa-spinner', val: '2', lab: 'In progress' },
          { icon: 'fa-share-nodes', val: '3', lab: 'Referrals raised' },
          { icon: 'fa-chart-line', val: '0.94', lab: 'Avg. acuity' }
        ],
        prescriptions: [
          { icon: 'fa-file-prescription', val: '14', lab: 'Issued this week' },
          { icon: 'fa-hourglass-half', val: '3', lab: 'Awaiting signature' },
          { icon: 'fa-triangle-exclamation', val: '5', lab: 'Expiring soon' },
          { icon: 'fa-rotate', val: '9', lab: 'Rechecks booked' }
        ]
      },

      appointments: [
        { time: '09:00', name: 'Amara Okafor', img: A + 'avatar-1.webp', type: 'Comprehensive exam', status: 'Confirmed' },
        { time: '09:40', name: 'Daniel Kim', img: A + 'avatar-2.webp', type: 'Contact lens fitting', status: 'Confirmed' },
        { time: '10:20', name: 'Sofia Marino', img: A + 'avatar-3.webp', type: 'Diabetic retina screen', status: 'Pending' },
        { time: '11:00', name: 'Liam Chen', img: A + 'avatar-4.webp', type: 'Glaucoma follow-up', status: 'Confirmed' },
        { time: '11:40', name: 'Priya Nair', img: A + 'avatar-1.webp', type: 'Paediatric vision test', status: 'Confirmed' },
        { time: '13:00', name: 'Tom Becker', img: A + 'avatar-2.webp', type: 'Post-op review', status: 'Pending' },
        { time: '14:20', name: 'Hannah Reid', img: A + 'avatar-3.webp', type: 'Dry-eye assessment', status: 'Cancelled' }
      ],

      patients: [
        { name: 'Amara Okafor', img: A + 'avatar-1.webp', age: 34, last: '12 Feb 2026', next: '12 Aug 2026', status: 'Reviewed' },
        { name: 'Daniel Kim', img: A + 'avatar-2.webp', age: 41, last: '28 Feb 2026', next: '28 Aug 2026', status: 'Reviewed' },
        { name: 'Sofia Marino', img: A + 'avatar-3.webp', age: 58, last: '04 Jan 2026', next: '02 Apr 2026', status: 'Due' },
        { name: 'Liam Chen', img: A + 'avatar-4.webp', age: 67, last: '19 Feb 2026', next: '19 May 2026', status: 'Review' },
        { name: 'Priya Nair', img: A + 'avatar-1.webp', age: 9, last: '22 Feb 2026', next: '22 Feb 2027', status: 'Reviewed' }
      ],

      exams: [
        { name: 'Amara Okafor', img: A + 'avatar-1.webp', test: 'Visual acuity', result: '6/6 both eyes', status: 'Complete' },
        { name: 'Daniel Kim', img: A + 'avatar-2.webp', test: 'Autorefraction', result: 'R -1.25 / L -1.00', status: 'Complete' },
        { name: 'Sofia Marino', img: A + 'avatar-3.webp', test: 'OCT macula', result: 'Mild thickening', status: 'Referral' },
        { name: 'Liam Chen', img: A + 'avatar-4.webp', test: 'Visual field', result: 'Within normal', status: 'Complete' },
        { name: 'Priya Nair', img: A + 'avatar-1.webp', test: 'Colour vision', result: 'Passed Ishihara', status: 'In progress' }
      ],

      prescriptions: [
        { name: 'Daniel Kim', img: A + 'avatar-2.webp', rx: 'OD -1.25 · OS -1.00', issued: '28 Feb 2026', status: 'Active' },
        { name: 'Amara Okafor', img: A + 'avatar-1.webp', rx: 'OD plano · OS -0.50', issued: '12 Feb 2026', status: 'Active' },
        { name: 'Liam Chen', img: A + 'avatar-4.webp', rx: 'OD +2.00 · OS +1.75', issued: '19 Feb 2026', status: 'Active' },
        { name: 'Sofia Marino', img: A + 'avatar-3.webp', rx: 'Reading add +2.25', issued: '04 Jan 2026', status: 'Draft' }
      ],

      activity: [
        { icon: 'fa-eye', text: 'Completed exam for Amara Okafor', time: '20 minutes ago' },
        { icon: 'fa-share-nodes', text: 'Raised a retinal referral for Sofia Marino', time: '1 hour ago' },
        { icon: 'fa-file-prescription', text: 'Issued a new prescription for Daniel Kim', time: 'Today' },
        { icon: 'fa-user-plus', text: 'New patient Priya Nair registered', time: 'Yesterday' }
      ],

      tasks: [
        { l: 'Review 3 OCT scans', s: 'Sofia Marino first · due today', done: false },
        { l: 'Sign Daniel Kim prescription', s: 'Drafted this morning', done: true },
        { l: 'Call Priya Nair guardian', s: 'Confirm the follow-up slot', done: false }
      ],

      followups: [
        { l: 'Glaucoma monitoring', v: 82 },
        { l: 'Diabetic retina reviews', v: 64 },
        { l: 'Post-op checks closed', v: 91 }
      ],

      threads: [
        { img: A + 'avatar-1.webp', name: 'Amara Okafor', sub: 'Can I wear lenses to the exam?' },
        { img: A + 'avatar-3.webp', name: 'Sofia Marino', sub: 'Requesting a copy of my OCT scan' },
        { img: A + 'avatar-2.webp', name: 'Daniel Kim', sub: 'Thanks — the new lenses feel great' }
      ],

      chart: [
        { l: 'Mon', v: 14 }, { l: 'Tue', v: 19 }, { l: 'Wed', v: 16 },
        { l: 'Thu', v: 22 }, { l: 'Fri', v: 25 }, { l: 'Sat', v: 11 }, { l: 'Sun', v: 4 }
      ]
    },

    /* ---------------------------------------------------- ADMINISTRATOR */
    administrator: {
      stats: {
        overview: [
          { icon: 'fa-calendar-check', val: '18', lab: "Today's bookings" },
          { icon: 'fa-users', val: '6', lab: 'Patients waiting' },
          { icon: 'fa-file-invoice-dollar', val: '4', lab: 'Invoices due' },
          { icon: 'fa-headset', val: '2', lab: 'Open queries' }
        ],
        appointments: [
          { icon: 'fa-calendar-day', val: '18', lab: 'Booked today' },
          { icon: 'fa-circle-check', val: '14', lab: 'Confirmed' },
          { icon: 'fa-hourglass-half', val: '3', lab: 'Pending' },
          { icon: 'fa-user-xmark', val: '1', lab: 'No-show' }
        ],
        patients: [
          { icon: 'fa-id-card', val: '4,912', lab: 'Registered patients' },
          { icon: 'fa-user-plus', val: '38', lab: 'New this week' },
          { icon: 'fa-shield-halved', val: '12', lab: 'Insurance pending' },
          { icon: 'fa-triangle-exclamation', val: '9', lab: 'High-risk flags' }
        ],
        billing: [
          { icon: 'fa-file-invoice', val: '$18,420', lab: 'Invoiced this month' },
          { icon: 'fa-circle-check', val: '$15,980', lab: 'Collected' },
          { icon: 'fa-clock', val: '$2,440', lab: 'Outstanding' },
          { icon: 'fa-rotate-left', val: '$360', lab: 'Refunded' }
        ],
        inventory: [
          { icon: 'fa-glasses', val: '486', lab: 'Frame SKUs' },
          { icon: 'fa-triangle-exclamation', val: '14', lab: 'Low on stock' },
          { icon: 'fa-box-open', val: '3', lab: 'Out of stock' },
          { icon: 'fa-layer-group', val: '2,140', lab: 'Lens units' }
        ]
      },

      appointments: [
        { time: '08:45', name: 'Grace Mensah', img: A + 'avatar-1.webp', type: 'Routine exam', status: 'Confirmed' },
        { time: '09:15', name: 'Noah Fischer', img: A + 'avatar-2.webp', type: 'New patient intake', status: 'Confirmed' },
        { time: '10:00', name: 'Lena Torres', img: A + 'avatar-3.webp', type: 'Frame fitting', status: 'Pending' },
        { time: '10:45', name: 'Omar Haddad', img: A + 'avatar-4.webp', type: 'Contact lens review', status: 'Confirmed' },
        { time: '11:30', name: 'Keira Doyle', img: A + 'avatar-1.webp', type: 'Billing consultation', status: 'Confirmed' },
        { time: '12:15', name: 'Ben Carter', img: A + 'avatar-2.webp', type: 'Routine exam', status: 'Cancelled' }
      ],

      registry: [
        { name: 'Grace Mensah', img: A + 'avatar-1.webp', id: 'P-10482', phone: '+31 6 2210 8841', status: 'Active' },
        { name: 'Noah Fischer', img: A + 'avatar-2.webp', id: 'P-10483', phone: '+31 6 3391 2207', status: 'Active' },
        { name: 'Lena Torres', img: A + 'avatar-3.webp', id: 'P-10484', phone: '+31 6 7742 1190', status: 'Active' },
        { name: 'Omar Haddad', img: A + 'avatar-4.webp', id: 'P-10485', phone: '+31 6 1180 6632', status: 'Pending' },
        { name: 'Keira Doyle', img: A + 'avatar-1.webp', id: 'P-10486', phone: '+31 6 9920 4471', status: 'Inactive' }
      ],

      invoices: [
        { id: '#INV-2041', name: 'Grace Mensah', img: A + 'avatar-1.webp', amount: '$180.00', due: '02 Mar 2026', status: 'Paid' },
        { id: '#INV-2042', name: 'Noah Fischer', img: A + 'avatar-2.webp', amount: '$240.00', due: '09 Mar 2026', status: 'Pending' },
        { id: '#INV-2043', name: 'Lena Torres', img: A + 'avatar-3.webp', amount: '$95.00', due: '21 Feb 2026', status: 'Overdue' },
        { id: '#INV-2044', name: 'Omar Haddad', img: A + 'avatar-4.webp', amount: '$360.00', due: '14 Mar 2026', status: 'Partial' },
        { id: '#INV-2045', name: 'Ben Carter', img: A + 'avatar-2.webp', amount: '$70.00', due: '28 Feb 2026', status: 'Refunded' }
      ],

      stock: [
        { name: 'Aurora Titanium Frame', img: A + 'doc-1.webp', sku: 'FR-AUR-22', units: 42, price: '$189', status: 'Active' },
        { name: 'Lumen Blue-Light Lens', img: A + 'doc-2.webp', sku: 'LN-LUM-08', units: 120, price: '$95', status: 'Active' },
        { name: 'Orbit Sport Frame', img: A + 'doc-3.webp', sku: 'FR-ORB-14', units: 9, price: '$149', status: 'Low stock' },
        { name: 'Halo Progressive Lens', img: A + 'doc-4.webp', sku: 'LN-HAL-03', units: 0, price: '$220', status: 'Out of stock' }
      ],

      activity: [
        { icon: 'fa-calendar-check', text: 'Booked Noah Fischer for a new-patient intake', time: '15 minutes ago' },
        { icon: 'fa-file-invoice-dollar', text: 'Payment received for invoice #INV-2041', time: '1 hour ago' },
        { icon: 'fa-user-plus', text: 'Registered 6 new patients at the front desk', time: 'Today' },
        { icon: 'fa-triangle-exclamation', text: 'Orbit Sport Frame dropped to 9 units', time: 'Yesterday' }
      ],

      tasks: [
        { l: 'Chase 3 overdue invoices', s: 'Oldest is 8 days late', done: false },
        { l: 'Confirm tomorrow\'s bookings', s: '4 patients still unconfirmed', done: false },
        { l: 'Reconcile the card terminal', s: 'Morning takings balanced', done: true }
      ],

      deskHealth: [
        { l: 'Bookings confirmed', v: 78 },
        { l: 'Invoices collected', v: 87 },
        { l: 'Calls answered in 1 min', v: 69 }
      ],

      threads: [
        { img: A + 'avatar-1.webp', name: 'Grace Mensah', sub: 'Could I move my appointment to Friday?' },
        { img: A + 'avatar-2.webp', name: 'Noah Fischer', sub: 'What insurance do you accept?' },
        { img: A + 'avatar-3.webp', name: 'Lena Torres', sub: 'Asking for a copy of my invoice' }
      ],

      chart: [
        { l: 'Mon', v: 22 }, { l: 'Tue', v: 27 }, { l: 'Wed', v: 19 },
        { l: 'Thu', v: 31 }, { l: 'Fri', v: 34 }, { l: 'Sat', v: 18 }, { l: 'Sun', v: 6 }
      ]
    }
  };

  var D = DATA[pageRole];

  /* ============================================================== views === */
  function optomViews() {
    return {
      overview: function () {
        return hero('Clinical desk', 'fa-user-doctor', 'Good to see you, ' + user.name,
          'Twelve appointments are booked today and three patients are waiting in reception.',
          { icon: 'fa-calendar-plus', label: 'New appointment' }) +
          stats('overview') +
          grid2(
            panel("Today's schedule", table(['Time', 'Patient', 'Type', 'Status'],
              D.appointments.slice(0, 5).map(function (r) {
                return [esc(r.time), prodCell(r.img, r.name, r.type), esc(r.type), pill(r.status)];
              })), { label: 'View all' }),
            panel('Recent activity', feed(D.activity))
          ) +
          grid3(
            panel('Follow-up care', progress(D.followups)),
            panel('Your checklist', todos(D.tasks)),
            panel('Clinic at a glance', kv([
              ['Patients today', '12'],
              ['Referrals this week', '3'],
              ['Avg. exam time', '32 min'],
              ['Patient satisfaction', '4.9 / 5']
            ]))
          ) +
          panel('Exams completed this week', chart(D.chart)) +
          panel('Quick actions', quick([
            { icon: 'fa-calendar-plus', label: 'New appointment' },
            { icon: 'fa-eye', label: 'Start an exam' },
            { icon: 'fa-file-prescription', label: 'Write prescription' },
            { icon: 'fa-chart-simple', label: 'Clinical reports' }
          ]));
      },

      appointments: function () {
        return stats('appointments') +
          panel('All appointments',
            table(['Time', 'Patient', 'Type', 'Status'], D.appointments.map(function (r) {
              return [esc(r.time), prodCell(r.img, r.name, r.type), esc(r.type), pill(r.status)];
            }))) +
          grid2(
            panel('Recall progress', progress([
              { l: 'Annual reviews sent', v: 74 },
              { l: 'Contact lens renewals', v: 58 },
              { l: 'Post-op checks scheduled', v: 90 }
            ])),
            panel('Today at a glance', kv([
              ['Booked', '12'],
              ['Confirmed', '9'],
              ['Awaiting confirm', '3'],
              ['Cancelled', '1']
            ]))
          ) +
          panel('How an appointment flows', steps([
            { l: 'Check in', p: 'Front desk confirms details and updates the record.' },
            { l: 'Pre-test', p: 'Acuity, pressure and autorefraction captured.' },
            { l: 'Consultation', p: 'Optometrist examines and discusses findings.' },
            { l: 'Dispense', p: 'Prescription issued and glasses or lenses ordered.' }
          ])) +
          panel('Quick actions', quick([
            { icon: 'fa-calendar-plus', label: 'Add booking' },
            { icon: 'fa-clock-rotate-left', label: 'Reschedule' },
            { icon: 'fa-bell', label: 'Send reminders' },
            { icon: 'fa-file-export', label: 'Export day list' }
          ]));
      },

      patients: function () {
        return stats('patients') +
          panel('Patient list',
            table(['Patient', 'Age', 'Last visit', 'Next visit', 'Status'], D.patients.map(function (p) {
              return [prodCell(p.img, p.name, 'Age ' + p.age), esc(String(p.age)), esc(p.last), esc(p.next), pill(p.status)];
            }))) +
          grid2(
            panel('Care reminders', timeline([
              { icon: 'fa-triangle-exclamation', l: 'Sofia Marino', s: 'Retina review due', p: 'OCT follow-up flagged from the last visit.' },
              { icon: 'fa-clock', l: 'Liam Chen', s: 'Glaucoma monitoring', p: 'Pressure check booked for May.' },
              { icon: 'fa-circle-check', l: 'Amara Okafor', s: 'Routine review complete', p: 'Next recall in six months.', done: true }
            ])),
            panel('Risk overview', hbars([
              { l: 'Glaucoma suspects', v: 7 },
              { l: 'Diabetic retinopathy', v: 12 },
              { l: 'Age-related macular', v: 5 },
              { l: 'Paediatric watch-list', v: 9 }
            ]))
          ) +
          panel('Quick actions', quick([
            { icon: 'fa-user-plus', label: 'Register patient' },
            { icon: 'fa-calendar-plus', label: 'Book recall' },
            { icon: 'fa-notes-medical', label: 'Open records' },
            { icon: 'fa-print', label: 'Print summary' }
          ]));
      },

      exams: function () {
        return stats('exams') +
          panel('Recent exam results',
            table(['Patient', 'Test', 'Result', 'Status'], D.exams.map(function (e) {
              return [prodCell(e.img, e.name, e.test), esc(e.test), esc(e.result), pill(e.status)];
            }))) +
          grid2(
            panel('Clinical pathway', progress([
              { l: 'Pre-test completed', v: 88 },
              { l: 'Optometrist review', v: 72 },
              { l: 'Results explained', v: 94 }
            ])),
            panel('Equipment status', kv([
              ['Autorefractor', 'Ready'],
              ['OCT scanner', 'Ready'],
              ['Visual field unit', 'Calibrating'],
              ['Tonometer', 'Ready']
            ]))
          ) +
          panel('Sample results this month', tiles([
            { icon: 'fa-eye', k: 'Acuity improved', v: '63', n: 'Patients with better vision' },
            { icon: 'fa-glasses', k: 'New prescriptions', v: '48', n: 'Issued in the last 30 days' },
            { icon: 'fa-share-nodes', k: 'Referrals', v: '11', n: 'Sent to ophthalmology' },
            { icon: 'fa-rotate', k: 'Rechecks', v: '9', n: 'Booked for review' }
          ])) +
          panel('Quick actions', quick([
            { icon: 'fa-eye', label: 'New exam' },
            { icon: 'fa-upload', label: 'Upload scan' },
            { icon: 'fa-share-nodes', label: 'Raise referral' },
            { icon: 'fa-notes-medical', label: 'Exam notes' }
          ]));
      },

      prescriptions: function () {
        return stats('prescriptions') +
          panel('Prescriptions issued',
            table(['Patient', 'Prescription', 'Issued', 'Status'], D.prescriptions.map(function (p) {
              return [prodCell(p.img, p.name, p.rx), esc(p.rx), esc(p.issued), pill(p.status)];
            }))) +
          grid2(
            panel('Sign-off queue', timeline([
              { icon: 'fa-pen-nib', l: 'Sofia Marino', s: 'Draft awaiting signature', p: 'Reading add +2.25 prepared today.' },
              { icon: 'fa-circle-check', l: 'Daniel Kim', s: 'Signed and sent to dispensing', p: 'Single-vision lenses ordered.', done: true },
              { icon: 'fa-circle-check', l: 'Liam Chen', s: 'Signed this week', p: 'Progressive lenses fitted.', done: true }
            ])),
            panel('Lens types this month', hbars([
              { l: 'Single vision', v: 52 },
              { l: 'Progressive', v: 34 },
              { l: 'Blue-light', v: 41 },
              { l: 'Contact lenses', v: 27 }
            ]))
          ) +
          note('Prescriptions are valid for 24 months. Recheck reminders are sent automatically 30 days before expiry.', 'fa-circle-info') +
          panel('Quick actions', quick([
            { icon: 'fa-file-prescription', label: 'New prescription' },
            { icon: 'fa-pen-nib', label: 'Sign drafts' },
            { icon: 'fa-rotate', label: 'Book recheck' },
            { icon: 'fa-print', label: 'Print copy' }
          ]));
      },

      messages: function () {
        return stats('overview') +
          grid2(
            panel('Patient threads', imgList(D.threads)),
            panel('Reply tools', quick([
              { icon: 'fa-pen', label: 'New message' },
              { icon: 'fa-bullhorn', label: 'Broadcast' },
              { icon: 'fa-bell-slash', label: 'Mute thread' },
              { icon: 'fa-inbox', label: 'Archived' }
            ]))
          ) +
          panel('Reply queue', timeline([
            { icon: 'fa-envelope', l: 'Amara Okafor', s: 'Can I wear lenses to the exam?', p: 'Waiting 40 minutes' },
            { icon: 'fa-envelope', l: 'Sofia Marino', s: 'Requesting a copy of my OCT scan', p: 'Waiting 2 hours' },
            { icon: 'fa-circle-check', l: 'Daniel Kim', s: 'Thanks — the new lenses feel great', p: 'Answered today', done: true }
          ])) +
          note('Patient messages stay inside Stackly. Never share clinical images over email — use the secure portal instead.', 'fa-shield-heart');
      }
    };
  }

  function adminViews() {
    return {
      overview: function () {
        return hero('Front desk', 'fa-bell-concierge', 'Good to see you, ' + user.name,
          'Eighteen bookings today, six patients in reception and four invoices still need chasing.',
          { icon: 'fa-calendar-plus', label: 'New booking' }) +
          stats('overview') +
          grid2(
            panel("Today's bookings", table(['Time', 'Patient', 'Type', 'Status'],
              D.appointments.slice(0, 5).map(function (r) {
                return [esc(r.time), prodCell(r.img, r.name, r.type), esc(r.type), pill(r.status)];
              })), { label: 'View all' }),
            panel('Recent activity', feed(D.activity))
          ) +
          grid3(
            panel('Front-desk health', progress(D.deskHealth)),
            panel('Your checklist', todos(D.tasks)),
            panel('Clinic at a glance', kv([
              ['Bookings today', '18'],
              ['Collected today', '$3,120'],
              ['Frames in stock', '486'],
              ['Open queries', '2']
            ]))
          ) +
          panel('Bookings this week', chart(D.chart)) +
          panel('Quick actions', quick([
            { icon: 'fa-calendar-plus', label: 'New booking' },
            { icon: 'fa-user-plus', label: 'Register patient' },
            { icon: 'fa-file-invoice-dollar', label: 'New invoice' },
            { icon: 'fa-chart-simple', label: 'Daily report' }
          ]));
      },

      appointments: function () {
        return stats('appointments') +
          panel('All bookings',
            table(['Time', 'Patient', 'Type', 'Status'], D.appointments.map(function (r) {
              return [esc(r.time), prodCell(r.img, r.name, r.type), esc(r.type), pill(r.status)];
            }))) +
          grid2(
            panel('Confirmation progress', progress([
              { l: 'Bookings confirmed', v: 78 },
              { l: 'Reminders sent', v: 92 },
              { l: 'Intake forms returned', v: 65 }
            ])),
            panel('Desk notes', timeline([
              { icon: 'fa-clock', l: 'Lena Torres', s: 'Awaiting confirmation call', p: 'Left a voicemail this morning.' },
              { icon: 'fa-circle-check', l: 'Omar Haddad', s: 'Contact lens review confirmed', p: 'Reminder sent by SMS.', done: true },
              { icon: 'fa-user-xmark', l: 'Ben Carter', s: 'Cancelled routine exam', p: 'Holding the slot for a rebook.' }
            ]))
          ) +
          panel('Booking flow', steps([
            { l: 'Enquiry', p: 'Patient calls or books online.' },
            { l: 'Slot held', p: 'Front desk reserves the diary time.' },
            { l: 'Confirmed', p: 'Reminder sent and intake form shared.' },
            { l: 'Checked in', p: 'Patient arrives and is queued for the clinician.' }
          ])) +
          panel('Quick actions', quick([
            { icon: 'fa-calendar-plus', label: 'Add booking' },
            { icon: 'fa-bell', label: 'Send reminders' },
            { icon: 'fa-clock-rotate-left', label: 'Reschedule' },
            { icon: 'fa-file-export', label: 'Export diary' }
          ]));
      },

      patients: function () {
        return stats('patients') +
          panel('Registered patients',
            table(['Patient', 'File ID', 'Phone', 'Status'], D.registry.map(function (p) {
              return [prodCell(p.img, p.name, p.id), esc(p.id), esc(p.phone), pill(p.status)];
            }))) +
          grid2(
            panel('Registration quality', progress([
              { l: 'Contact details complete', v: 96 },
              { l: 'Insurance verified', v: 71 },
              { l: 'Consent forms signed', v: 88 }
            ])),
            panel('Front-desk overview', kv([
              ['Registered today', '6'],
              ['Insurance pending', '12'],
              ['Recall letters waiting', '24'],
              ['High-risk flags', '9']
            ]))
          ) +
          panel('Quick actions', quick([
            { icon: 'fa-user-plus', label: 'Register patient' },
            { icon: 'fa-id-card', label: 'Update details' },
            { icon: 'fa-shield-halved', label: 'Verify insurance' },
            { icon: 'fa-print', label: 'Print file' }
          ]));
      },

      billing: function () {
        return stats('billing') +
          panel('Invoices',
            table(['Invoice', 'Patient', 'Amount', 'Due', 'Status'], D.invoices.map(function (inv) {
              return [esc(inv.id), prodCell(inv.img, inv.name, inv.id), esc(inv.amount), esc(inv.due), pill(inv.status)];
            }))) +
          grid2(
            panel('Collection progress', progress([
              { l: 'Invoices paid', v: 87 },
              { l: 'Reminders sent', v: 64 },
              { l: 'Payment plans active', v: 12 }
            ])),
            panel('Money at a glance', kv([
              ['Invoiced this month', '$18,420'],
              ['Collected', '$15,980'],
              ['Outstanding', '$2,440'],
              ['Refunded', '$360']
            ]))
          ) +
          panel('Payment activity', timeline([
            { icon: 'fa-circle-check', l: '#INV-2041 · Grace Mensah', s: '$180.00 received', p: 'Card payment at the desk.', done: true },
            { icon: 'fa-clock', l: '#INV-2043 · Lena Torres', s: '$95.00 overdue', p: 'Second reminder going out today.' },
            { icon: 'fa-rotate-left', l: '#INV-2045 · Ben Carter', s: '$70.00 refunded', p: 'Exam cancelled and refunded in full.' }
          ])) +
          panel('Quick actions', quick([
            { icon: 'fa-file-invoice-dollar', label: 'New invoice' },
            { icon: 'fa-money-bill-wave', label: 'Record payment' },
            { icon: 'fa-receipt', label: 'Print receipt' },
            { icon: 'fa-chart-line', label: 'Revenue report' }
          ]));
      },

      inventory: function () {
        return stats('inventory') +
          panel('Frames & lenses',
            table(['Item', 'SKU', 'Units', 'Price', 'Status'], D.stock.map(function (s) {
              return [prodCell(s.img, s.name, s.sku), esc(s.sku), esc(String(s.units)), esc(s.price), pill(s.status)];
            }))) +
          grid2(
            panel('Stock health', progress([
              { l: 'Healthy lines', v: 82 },
              { l: 'Reorder triggered', v: 24 },
              { l: 'Supplier deliveries on time', v: 91 }
            ])),
            panel('Stock alerts', timeline([
              { icon: 'fa-triangle-exclamation', l: 'Orbit Sport Frame', s: 'Only 9 left', p: 'Reorder point is 15 — raise a purchase order.' },
              { icon: 'fa-box-open', l: 'Halo Progressive Lens', s: 'Out of stock', p: 'Back in stock expected early next week.' },
              { icon: 'fa-circle-check', l: 'Lumen Blue-Light Lens', s: '120 units in stock', p: 'Comfortable cover for the next month.', done: true }
            ]))
          ) +
          panel('Units by category', hbars([
            { l: 'Single-vision lenses', v: 120, s: '120' },
            { l: 'Titanium frames', v: 42, s: '42' },
            { l: 'Sport frames', v: 9, s: '9' },
            { l: 'Progressive lenses', v: 0, s: '0' }
          ])) +
          panel('Quick actions', quick([
            { icon: 'fa-boxes-stacked', label: 'Add stock' },
            { icon: 'fa-file-import', label: 'Bulk import' },
            { icon: 'fa-tags', label: 'Edit prices' },
            { icon: 'fa-truck-fast', label: 'Purchase order' }
          ]));
      },

      messages: function () {
        return stats('overview') +
          grid2(
            panel('Patient threads', imgList(D.threads)),
            panel('Desk tools', quick([
              { icon: 'fa-pen', label: 'New message' },
              { icon: 'fa-headset', label: 'Log a call' },
              { icon: 'fa-bell-slash', label: 'Mute thread' },
              { icon: 'fa-inbox', label: 'Archived' }
            ]))
          ) +
          panel('Reply queue', timeline([
            { icon: 'fa-envelope', l: 'Grace Mensah', s: 'Could I move my appointment to Friday?', p: 'Waiting 20 minutes' },
            { icon: 'fa-envelope', l: 'Noah Fischer', s: 'What insurance do you accept?', p: 'Waiting 1 hour' },
            { icon: 'fa-circle-check', l: 'Lena Torres', s: 'Asking for a copy of my invoice', p: 'Answered this morning', done: true }
          ])) +
          note('Never ask for card details in a message thread — take payment only through the billing screen.', 'fa-shield-halved');
      }
    };
  }

  var VIEWS = (pageRole === 'administrator') ? adminViews() : optomViews();
  var menu = MENU[pageRole];

  /* =============================================================== shell == */
  var side = doc.getElementById('dashSide');
  var scrim = doc.getElementById('dashScrim');
  var burger = doc.getElementById('dashBurger');
  var sideClose = doc.getElementById('dashSideClose');
  var nav = doc.getElementById('dashNav');
  var view = doc.getElementById('dashView');
  var titleEl = doc.getElementById('dashTitle');
  var welcomeEl = doc.getElementById('dashWelcome');
  var searchBox = doc.getElementById('dashSearchBox');
  var searchInput = doc.getElementById('dashSearch');
  var avatarA = doc.getElementById('dashAvatar');
  var avatarB = doc.getElementById('dashAvatarB');
  var nameA = doc.getElementById('dashName');
  var nameB = doc.getElementById('dashNameB');
  var emailA = doc.getElementById('dashEmail');
  var emailB = doc.getElementById('dashEmailB');
  var roleEl = doc.getElementById('dashRole');

  function initial(name) {
    var n = (name || 'S').trim();
    return n.charAt(0).toUpperCase();
  }
  var ini = initial(user.name);

  if (roleEl) roleEl.textContent = ROLE_LABEL[pageRole];
  [avatarA, avatarB].forEach(function (el) { if (el) el.textContent = ini; });
  [nameA, nameB].forEach(function (el) { if (el) el.textContent = user.name; });
  [emailA, emailB].forEach(function (el) { if (el) el.textContent = user.email; });

  /* build sidebar nav */
  menu.forEach(function (item, i) {
    var btn = doc.createElement('button');
    btn.type = 'button';
    btn.className = 'side-link' + (i === 0 ? ' is-on' : '');
    btn.setAttribute('data-view', item.key);
    if (i === 0) btn.setAttribute('aria-current', 'page');
    btn.innerHTML = '<i class="fa-solid ' + item.icon + '" aria-hidden="true"></i><span>' + esc(item.label) + '</span>';
    btn.addEventListener('click', function () { show(item.key, item.label); });
    nav.appendChild(btn);
  });

  /* router */
  function animate() {
    win.requestAnimationFrame(function () {
      view.querySelectorAll('.d-bar[data-h]').forEach(function (el) { el.style.height = el.getAttribute('data-h') + 'px'; });
      view.querySelectorAll('.d-fill[data-w], .hbar__fill[data-w]').forEach(function (el) { el.style.width = el.getAttribute('data-w') + '%'; });
    });
  }

  function show(key, label) {
    var render = VIEWS[key];
    show.currentKey = key;
    nav.querySelectorAll('.side-link').forEach(function (btn) {
      var on = btn.getAttribute('data-view') === key;
      btn.classList.toggle('is-on', on);
      if (on) btn.setAttribute('aria-current', 'page'); else btn.removeAttribute('aria-current');
    });
    if (titleEl) titleEl.textContent = label;
    if (welcomeEl) {
      welcomeEl.textContent = (key === 'overview') ? ('Signed in as ' + user.email) : '';
      welcomeEl.hidden = (key !== 'overview');
    }
    view.innerHTML = render ? ('<div class="view">' + render() + '</div>') : '';
    animate();
    if (searchInput) searchInput.value = '';
    win.scrollTo(0, 0);
    closeMenu();
  }

  /* fullscreen menu */
  function menuOpen() { return side && side.classList.contains('is-open'); }
  function openMenu() {
    if (!side) return;
    side.classList.add('is-open');
    side.setAttribute('aria-hidden', 'false');
    if (scrim) scrim.classList.add('is-on');
    if (burger) burger.setAttribute('aria-expanded', 'true');
    doc.body.classList.add('is-locked');
  }
  function closeMenu() {
    if (!side) return;
    side.classList.remove('is-open');
    var mobile = win.innerWidth <= 980;
    side.setAttribute('aria-hidden', mobile ? 'true' : 'false');
    if (scrim) scrim.classList.remove('is-on');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    doc.body.classList.remove('is-locked');
  }

  if (burger) burger.addEventListener('click', openMenu);
  if (sideClose) sideClose.addEventListener('click', closeMenu);
  if (scrim) scrim.addEventListener('click', closeMenu);
  win.addEventListener('resize', function () { if (win.innerWidth > 980) closeMenu(); });
  doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menuOpen()) closeMenu(); });

  /* search */
  if (searchInput) {
    var placeholder = searchInput.getAttribute('placeholder') || '';
    searchInput.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter') return;
      e.preventDefault();
      var term = searchInput.value.trim();
      if (!term) {
        if (searchBox) {
          searchBox.classList.add('is-bad');
          searchInput.setAttribute('placeholder', 'Type something to search');
          win.setTimeout(function () {
            searchBox.classList.remove('is-bad');
            searchInput.setAttribute('placeholder', term || 'Search appointments, patients, invoices…');
          }, 1600);
        }
        toast('Type something to search', true);
        return;
      }
      win.location.href = DEAD;
    });
  }

  /* logout */
  var logout = doc.getElementById('dashLogout');
  if (logout) {
    logout.addEventListener('click', function () {
      try { win.localStorage.removeItem(USER_KEY); } catch (e) {}
      win.location.href = LOGIN_PAGE;
    });
  }

  /* demo actions + toasts */
  var toasts = doc.getElementById('dashToasts');
  function toast(message, isBad) {
    if (!toasts) return;
    var el = doc.createElement('div');
    el.className = 'toast' + (isBad ? ' is-bad' : '');
    el.innerHTML = '<i class="fa-solid ' + (isBad ? 'fa-circle-exclamation' : 'fa-circle-check') + '" aria-hidden="true"></i><span>' + esc(message) + '</span>';
    toasts.appendChild(el);
    win.setTimeout(function () {
      el.style.opacity = '0';
      el.style.transform = 'translateY(10px)';
      win.setTimeout(function () { el.remove(); }, 320);
    }, 2800);
  }

  /* placeholder actions navigate to the 404 page (see DEAD) */

  /* boot */
  show(menu[0].key, menu[0].label);

  win.addEventListener('pageshow', function (e) { if (e.persisted) closeMenu(); });
})();