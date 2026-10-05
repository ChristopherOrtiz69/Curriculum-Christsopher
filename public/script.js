(function () {
  var root = document.documentElement;
  var langBtn = document.getElementById('langBtn');
  var themeBtn = document.getElementById('themeBtn');

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    langBtn.textContent = lang === 'es' ? 'EN' : 'ES';
    store('lang', lang);
  }

  var params = new URLSearchParams(location.search);
  var initial = params.get('lang') || load('lang') ||
    ((navigator.language || 'es').toLowerCase().indexOf('es') === 0 ? 'es' : 'en');
  setLang(initial === 'en' ? 'en' : 'es');

  langBtn.addEventListener('click', function () {
    setLang(root.getAttribute('data-lang') === 'es' ? 'en' : 'es');
  });

  var savedTheme = load('theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  themeBtn.addEventListener('click', function () {
    var dark = root.getAttribute('data-theme') === 'dark' ||
      (!root.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches);
    var next = dark ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store('theme', next);
  });
})();
