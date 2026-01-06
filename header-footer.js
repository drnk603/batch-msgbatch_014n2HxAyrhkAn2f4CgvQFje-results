(function () {
  var root = document.documentElement;
  var header = document.querySelector('.hf-header');
  var toggle = document.querySelector('.hf-nav-toggle');
  var nav = document.getElementById('hf-primary-nav');
  var megaToggle = header ? header.querySelector('.hf-nav-link-button') : null;
  var megamenu = header ? header.querySelector('.hf-megamenu') : null;
  var footerYear = document.querySelector('.hf-footer-year');
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }
  function closeNav() {
    if (!root.classList.contains('hf-nav-open')) return;
    root.classList.remove('hf-nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      root.classList.toggle('hf-nav-open', !expanded);
    });
    nav.addEventListener('click', function (event) {
      var target = event.target;
      if (target && target.tagName === 'A') {
        closeNav();
      }
    });
  }
  if (megaToggle && megamenu) {
    megaToggle.addEventListener('click', function () {
      var expanded = megaToggle.getAttribute('aria-expanded') === 'true';
      megaToggle.setAttribute('aria-expanded', String(!expanded));
      megamenu.classList.toggle('hf-megamenu-open', !expanded);
    });
    document.addEventListener('click', function (event) {
      if (!megamenu.classList.contains('hf-megamenu-open')) return;
      if (!header.contains(event.target)) {
        megaToggle.setAttribute('aria-expanded', 'false');
        megamenu.classList.remove('hf-megamenu-open');
      }
    });
  }
})();