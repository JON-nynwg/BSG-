/* BSG enhance.js — appearance-only behaviour. No payment logic.
   Everything degrades gracefully: with JS off the pages are plain and fully readable. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover:hover) and (pointer:fine)').matches;
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || d).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) {} return null; }

  /* ---------- dark / light toggle ---------- */
  var saved = store('bsg-theme');
  if (saved === 'dark') root.setAttribute('data-theme', 'dark');
  var tbtn = d.createElement('button');
  tbtn.type = 'button'; tbtn.className = 'fx-theme';
  function paintToggle() {
    var dark = root.getAttribute('data-theme') === 'dark';
    tbtn.setAttribute('aria-pressed', String(dark));
    tbtn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    tbtn.innerHTML = dark ? '&#9728;' : '&#9790;';
  }
  tbtn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') !== 'dark';
    if (dark) root.setAttribute('data-theme', 'dark'); else root.removeAttribute('data-theme');
    store('bsg-theme', dark ? 'dark' : 'light');
    paintToggle(); paintWaves();
  });
  d.body.appendChild(tbtn); paintToggle();

  /* ---------- reveal animation (staggered) ---------- */
  root.classList.add('js-fx');
  var revealSel = '.program-card,.pillar-card,.value-card,.impact-item,.step-item,.myth-card,.research-card,.priority-item,.team-card:not(.reveal),.cofounder-card:not(.reveal),.story-teaser:not(.reveal),.fx-timeline li,.fx-aid-step,.fx-dash-card,.fx-facts div,.fx-aid-alert,.fx-reach>*,.fx-band-inner,.fx-news,.fx-cta-inner>div:first-child,.fx-tabs,.faq-item:not(.reveal),.voice-card,.cta-box,.impact-callout';
  var fxEls = $$(revealSel);
  fxEls.forEach(function (el) {
    el.classList.add('fx');
    var sib = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0;
    el.style.setProperty('--fx-d', Math.min(sib, 6) * 0.08 + 's');
  });
  var pictos = $$('.fx-picto,.stat-card');
  if (!('IntersectionObserver' in window) || reduce) {
    fxEls.concat(pictos).forEach(function (e) { e.classList.add('fx-in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('fx-in'); io.unobserve(e.target); } });
    }, { threshold: .12, rootMargin: '0px 0px -6% 0px' });
    fxEls.concat(pictos).forEach(function (e) { io.observe(e); });
    setTimeout(function () { fxEls.forEach(function (e) { if (!e.classList.contains('fx-in')) { var r = e.getBoundingClientRect(); if (r.top < innerHeight) e.classList.add('fx-in'); } }); }, 1600);
  }
  /* pictogram people fill in one after another */
  $$('.fx-picto i').forEach(function (i, n) { i.style.setProperty('--fx-d', (n % 10) * 0.09 + 's'); });

  /* ---------- wave dividers between sections ---------- */
  var waves = [];
  function solid(c) { var m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; var p = m[1].split(',').map(parseFloat); return (p.length < 4 || p[3] === 1) ? c : null; }
  var wavePath = 'M0,34 C180,70 360,2 600,30 C840,58 1080,6 1260,30 C1350,42 1410,36 1440,30 L1440,60 L0,60 Z';
  $$('main>section').forEach(function (sec, i) {
    if (i === 0 || sec.classList.contains('fx-band')) return;
    var w = d.createElement('div'); w.className = 'fx-wave'; w.setAttribute('aria-hidden', 'true');
    w.innerHTML = '<svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="' + wavePath + '"/></svg>';
    sec.insertBefore(w, sec.firstChild); waves.push({ sec: sec, el: w });
  });
  function paintWaves() {
    waves.forEach(function (o) {
      var c = solid(getComputedStyle(o.sec).backgroundColor);
      var prev = o.sec.previousElementSibling, pc = prev ? solid(getComputedStyle(prev).backgroundColor) : null;
      if (!c || c === pc) { o.el.style.display = 'none'; return; }
      o.el.style.display = ''; o.el.querySelector('path').setAttribute('fill', c);
    });
  }
  paintWaves(); window.addEventListener('load', paintWaves);

  /* ---------- parallax photo bands (disabled for reduced motion / touch) ---------- */
  var bands = $$('.fx-band');
  if (bands.length && !reduce && fine) {
    var tick = false;
    var upd = function () {
      tick = false;
      bands.forEach(function (b) {
        var r = b.getBoundingClientRect(); if (r.bottom < 0 || r.top > innerHeight) return;
        var p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
        b.querySelector('.fx-band-bg').style.setProperty('--py', (p * -60).toFixed(1) + 'px');
      });
    };
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  }

  /* ---------- hero follows the pointer very slightly ---------- */
  var hero = $('.hero-media');
  if (hero && !reduce && fine) {
    var ban = hero.parentNode, tx = 0, ty = 0, cx = 0, cy = 0, run = false;
    ban.style.overflow = 'hidden';
    var loop = function () {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      hero.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0) scale(1.025)';
      if (Math.abs(tx - cx) > .05 || Math.abs(ty - cy) > .05) requestAnimationFrame(loop); else run = false;
    };
    ban.addEventListener('pointermove', function (e) {
      var r = ban.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - .5) * -14; ty = ((e.clientY - r.top) / r.height - .5) * -8;
      if (!run) { run = true; requestAnimationFrame(loop); }
    });
    ban.addEventListener('pointerleave', function () { tx = 0; ty = 0; if (!run) { run = true; requestAnimationFrame(loop); } });
  }

  /* ---------- gentle hover tilt on founder photos ---------- */
  if (!reduce && fine) {
    $$('.team-photo,.founder-mini img,.voice-photo').forEach(function (el) {
      el.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)'; el.style.willChange = 'transform';
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        el.style.transform = 'perspective(700px) rotateY(' + (x * 6).toFixed(2) + 'deg) rotateX(' + (-y * 6).toFixed(2) + 'deg)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ---------- progress rings for percentage stats ---------- */
  $$('.stats-grid .stat-card').forEach(function (card) {
    var n = $('.stat-number', card); if (!n) return;
    var m = n.textContent.match(/^(\d+)%$/); if (!m) return;
    card.style.setProperty('--p', m[1]);
    var ring = d.createElement('div');
    ring.innerHTML = '<svg class="fx-ring" viewBox="0 0 100 100" aria-hidden="true"><circle class="tr" cx="50" cy="50" r="42"/><circle class="pg" cx="50" cy="50" r="42"/></svg>';
    card.insertBefore(ring.firstChild, card.firstChild);
  });

  /* ---------- FAQ accordion ---------- */
  var faq = $('.faq-list');
  if (faq) {
    faq.classList.add('fx-acc-on');
    $$('.faq-item', faq).forEach(function (it, i) {
      var h = $('h3', it), p = $('p', it); if (!h || !p) return;
      var id = 'faq-a-' + i; p.id = id;
      h.setAttribute('role', 'button'); h.tabIndex = 0; h.setAttribute('aria-controls', id);
      function set(open) { it.classList.toggle('open', open); h.setAttribute('aria-expanded', String(open)); }
      set(i === 0);
      h.addEventListener('click', function () { set(!it.classList.contains('open')); });
      h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); set(!it.classList.contains('open')); } });
    });
  }

  /* ---------- tabs (programs "how we work") ---------- */
  $$('[data-tabs]').forEach(function (list) {
    var items = $$('.step-item', list); if (items.length < 2) return;
    var wrap = d.createElement('div'); wrap.className = 'fx-tabs';
    var tl = d.createElement('div'); tl.className = 'fx-tablist'; tl.setAttribute('role', 'tablist');
    wrap.appendChild(tl); var panels = [], tabs = [];
    items.forEach(function (it, i) {
      var title = $('h4', it).textContent, body = $('p', it).textContent;
      var t = d.createElement('button'); t.type = 'button'; t.className = 'fx-tab'; t.setAttribute('role', 'tab');
      t.id = 'fx-tab-' + i; t.setAttribute('aria-controls', 'fx-panel-' + i); t.textContent = (i + 1) + '. ' + title; tl.appendChild(t); tabs.push(t);
      var p = d.createElement('div'); p.className = 'fx-panel'; p.id = 'fx-panel-' + i; p.setAttribute('role', 'tabpanel'); p.setAttribute('aria-labelledby', t.id);
      var big = d.createElement('div'); big.className = 'big'; big.textContent = '0' + (i + 1);
      var txt = d.createElement('div'); var h = d.createElement('h4'); h.textContent = title; var pp = d.createElement('p'); pp.textContent = body;
      txt.appendChild(h); txt.appendChild(pp); p.appendChild(big); p.appendChild(txt); wrap.appendChild(p); panels.push(p);
    });
    function show(i) { tabs.forEach(function (t, k) { t.setAttribute('aria-selected', String(k === i)); t.tabIndex = k === i ? 0 : -1; panels[k].classList.toggle('on', k === i); }); }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(i); });
      t.addEventListener('keydown', function (e) {
        var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!k) return;
        var n = (i + k + tabs.length) % tabs.length; show(n); tabs[n].focus();
      });
    });
    show(0); list.parentNode.replaceChild(wrap, list);
  });

  /* ---------- on-this-page rail ---------- */
  var main = $('main[data-toc]');
  if (main) {
    var secs = $$('section', main).filter(function (s) { return $('h2', s); });
    if (secs.length > 2) {
      var nav = d.createElement('nav'); nav.className = 'fx-toc'; nav.setAttribute('aria-label', 'On this page');
      nav.innerHTML = '<b>On this page</b>';
      var links = secs.map(function (s, i) {
        if (!s.id) s.id = 'sec-' + (i + 1);
        var a = d.createElement('a'); a.href = '#' + s.id; a.textContent = $('h2', s).textContent.replace(/\.$/, ''); nav.appendChild(a); return a;
      });
      d.body.appendChild(nav);
      if ('IntersectionObserver' in window) {
        var so = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { links.forEach(function (l) { l.classList.toggle('on', l.hash === '#' + e.target.id); }); } });
        }, { rootMargin: '-35% 0px -55% 0px' });
        secs.forEach(function (s) { so.observe(s); });
      }
    }
  }

  /* ---------- closing call-to-action + newsletter-style block ---------- */
  var footer = d.getElementById('footer');
  if (footer && !$('.fx-cta')) {
    var cta = d.createElement('section'); cta.className = 'fx-cta';
    cta.innerHTML =
      '<div class="fx-cta-inner">' +
      '<div><span class="eyebrow">Join the movement</span>' +
      '<h2>Help us end the silence around epilepsy.</h2>' +
      '<p>Support our work, partner with us, or tell us you would like to hear about programs and events.</p>' +
      '<div class="fx-cta-actions"><a href="#" class="fx-btn fx-donate">Support BSG</a>' +
      '<a class="fx-btn ghost" href="mailto:info@beyondseizureglobal.org?subject=Partnership%20enquiry">Partner with us</a></div></div>' +
      '<form class="fx-news" novalidate><label for="fx-news-email">Stay in the loop</label>' +
      '<div class="row"><input id="fx-news-email" type="email" required autocomplete="email" placeholder="Your email address">' +
      '<button class="fx-btn" type="submit">Subscribe</button></div>' +
      '<small>This opens your email app with a ready-to-send request to info@beyondseizureglobal.org.</small></form></div>';
    footer.parentNode.insertBefore(cta, footer);
    var form = $('.fx-news', cta);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = $('input', form), v = inp.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { inp.focus(); inp.setAttribute('aria-invalid', 'true'); return; }
      inp.removeAttribute('aria-invalid');
      location.href = 'mailto:info@beyondseizureglobal.org?subject=' + encodeURIComponent('Newsletter sign-up') +
        '&body=' + encodeURIComponent('Please add this address to the BSG updates list: ' + v);
    });
    $('.fx-donate', cta).addEventListener('click', function (e) {
      e.preventDefault(); var o = d.getElementById('donate-modal-overlay'); if (o) o.classList.add('open');
    });
    cta.querySelectorAll('.fx-news,.fx-cta-inner>div:first-child').forEach(function (el) { el.classList.add('fx', 'fx-in'); });
  }
})();
