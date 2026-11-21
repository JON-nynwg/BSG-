(function () {
  var d = document;
  d.documentElement.classList.add('js-reveal');

  // scroll progress bar
  var bar = d.createElement('div'); bar.className = 'scroll-progress'; d.body.appendChild(bar);
  // back to top
  var top = d.createElement('button'); top.className = 'back-top'; top.setAttribute('aria-label', 'Back to top');
  top.innerHTML = '&uarr;'; d.body.appendChild(top);
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  function onScroll() {
    var h = d.documentElement, max = h.scrollHeight - h.clientHeight;
    bar.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    top.classList.toggle('show', h.scrollTop > 600);
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // auto-reveal common blocks
  d.querySelectorAll('.team-card, .founder-mini, .stat-card, .section-heading, .story-teaser, .resource-card, .faq-item')
    .forEach(function (el) { el.classList.add('reveal'); });

  // counters
  function count(el) {
    var m = el.textContent.match(/^(\D*)([\d.,]+)(.*)$/); if (!m) return;
    var end = parseFloat(m[2].replace(/,/g, '')), t0 = null, dur = 1400;
    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1), v = Math.round(end * (1 - Math.pow(1 - p, 3)));
      el.textContent = m[1] + v + m[3];
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    d.querySelectorAll('.reveal').forEach(function (e) { e.classList.add('in'); }); return;
  }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      var n = e.target.querySelector && e.target.querySelector('.stat-number');
      if (n && !n.dataset.done && !matchMedia('(prefers-reduced-motion: reduce)').matches) { n.dataset.done = 1; count(n); }
      io.unobserve(e.target);
    });
  }, { threshold: .15 });
  d.querySelectorAll('.reveal').forEach(function (e) { io.observe(e); });
})();

// Responsive navigation and repeatable alternating service entrances.
(function(){
 var menu=document.querySelector('.bsg-menu'),nav=document.querySelector('#nav');
 if(menu&&nav){menu.addEventListener('click',function(){var open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('menu-open',open)});nav.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.setAttribute('aria-expanded','false');nav.classList.remove('menu-open')})})}
 if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
 var observer=new IntersectionObserver(function(entries){entries.forEach(function(e){e.target.classList.toggle('motion-visible',e.isIntersecting);e.target.classList.toggle('motion-pending',!e.isIntersecting)})},{threshold:.15});
 document.querySelectorAll('.process-card').forEach(function(row){row.classList.add('motion-pending');observer.observe(row)});
})();
