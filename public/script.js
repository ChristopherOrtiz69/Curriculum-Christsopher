(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function lang() { return root.getAttribute('data-lang') === 'en' ? 'en' : 'es'; }

  /* ---------- Idioma ---------- */
  var langBtn = document.getElementById('langBtn');
  function applyLang(l) {
    root.setAttribute('data-lang', l);
    root.setAttribute('lang', l);
    langBtn.textContent = l === 'es' ? 'EN' : 'ES';
    store('lang', l);
    restartTyping();
  }
  langBtn.textContent = lang() === 'es' ? 'EN' : 'ES';
  langBtn.addEventListener('click', function () { applyLang(lang() === 'es' ? 'en' : 'es'); });

  /* ---------- Tema ---------- */
  document.getElementById('themeBtn').addEventListener('click', function () {
    var cur = root.getAttribute('data-theme');
    var dark = cur ? cur === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('theme', next);
  });

  /* ---------- Menu movil ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var links = document.getElementById('links');
  menuBtn.addEventListener('click', function () {
    var open = links.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', function (e) {
    if (e.target.closest('a')) { links.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
  });

  /* ---------- Nav con borde al hacer scroll + link activo ---------- */
  var nav = document.getElementById('nav');
  var sections = ['proyectos', 'experiencia', 'skills', 'contacto'].map(function (id) { return document.getElementById(id); });
  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 8);
    var y = window.scrollY + 120, active = null;
    sections.forEach(function (s) { if (s && s.offsetTop <= y) active = s.id; });
    links.querySelectorAll('a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + active); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Rol con efecto de escritura ---------- */
  var roles = {
    es: ['.NET Software Engineer', 'AI Engineer · RAG & LLMs', 'Mobile Developer · .NET MAUI', 'Front-end & UI/UX'],
    en: ['.NET Software Engineer', 'AI Engineer · RAG & LLMs', 'Mobile Developer · .NET MAUI', 'Front-end & UI/UX']
  };
  var typedEl = document.getElementById('typed');
  var typeTimer = null;
  function restartTyping() {
    clearTimeout(typeTimer);
    var list = roles[lang()], i = 0, c = 0, deleting = false;
    if (reduce) { typedEl.textContent = list[0]; return; }
    (function tick() {
      var word = list[i];
      c += deleting ? -1 : 1;
      typedEl.textContent = word.slice(0, c);
      var wait = deleting ? 35 : 70;
      if (!deleting && c === word.length) { deleting = true; wait = 1800; }
      else if (deleting && c === 0) { deleting = false; i = (i + 1) % list.length; wait = 300; }
      typeTimer = setTimeout(tick, wait);
    })();
  }
  restartTyping();

  /* ---------- Editor: lineas aparecen en secuencia ---------- */
  var code = document.getElementById('code');
  code.querySelectorAll('.ln').forEach(function (ln, i) { ln.style.setProperty('--i', i); });
  requestAnimationFrame(function () { code.classList.add('run'); });

  /* ---------- Reveal + contadores ---------- */
  function countUp(el) {
    var target = +el.getAttribute('data-count');
    if (reduce) { el.textContent = target.toLocaleString('en-US'); return; }
    var start = null, dur = 1600;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        if (e.target.hasAttribute('data-count')) countUp(e.target);
        io.unobserve(e.target);
      });
    }, { threshold: 0.15 });
    document.querySelectorAll('.reveal, [data-count]').forEach(function (el) { io.observe(el); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    document.querySelectorAll('[data-count]').forEach(countUp);
  }

  /* ---------- Spotlight que sigue al cursor en proyectos ---------- */
  document.querySelectorAll('.project').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- QR decorativo (21x21 con patrones de posicion) ---------- */
  var qr = document.getElementById('qr');
  if (qr) {
    var seed = 7;
    function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
    function finder(x, y) {
      var spots = [[0, 0], [14, 0], [0, 14]];
      for (var s = 0; s < spots.length; s++) {
        var dx = x - spots[s][0], dy = y - spots[s][1];
        if (dx >= 0 && dx < 7 && dy >= 0 && dy < 7) {
          var edge = dx === 0 || dx === 6 || dy === 0 || dy === 6;
          var core = dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4;
          return edge || core ? 1 : 0;
        }
        if (dx >= -1 && dx <= 7 && dy >= -1 && dy <= 7) return 0;
      }
      return -1;
    }
    var html = '';
    for (var y = 0; y < 21; y++) for (var x = 0; x < 21; x++) {
      var f = finder(x, y);
      var on = f === -1 ? rnd() > 0.5 : f === 1;
      html += on ? '<i></i>' : '<i class="off"></i>';
    }
    qr.innerHTML = html;
  }

  /* ---------- Filtro de habilidades ---------- */
  var filters = document.querySelectorAll('.filter');
  var chips = document.querySelectorAll('#chips li');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-f');
      filters.forEach(function (b) { var on = b === btn; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
      chips.forEach(function (c) { c.classList.toggle('dim', f !== 'all' && c.getAttribute('data-c') !== f); });
    });
  });

  /* ---------- Copiar email ---------- */
  var copyBtn = document.getElementById('copyEmail');
  var copyMsg = document.getElementById('copyMsg');
  var copyOriginal = copyMsg.innerHTML;
  copyBtn.addEventListener('click', function () {
    var done = function () {
      copyMsg.innerHTML = '<span lang="es">¡Copiado! ✓</span><span lang="en">Copied! ✓</span>';
      setTimeout(function () { copyMsg.innerHTML = copyOriginal; }, 2000);
    };
    if (navigator.clipboard) navigator.clipboard.writeText('chris-ivan06@hotmail.com').then(done, function () {});
  });
})();
