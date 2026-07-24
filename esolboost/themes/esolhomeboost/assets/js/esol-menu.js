/* ESOL Katalóg mega menu — otváranie panelu, prepínanie panes, klávesnica. Vanilla, bez závislostí. */
(function () {
  'use strict';
  var root = document.querySelector('.esol-catalog');
  if (!root) return;
  var btn = root.querySelector('.esol-cat-toggle');
  var panel = root.querySelector('.esol-cat-panel');
  var links = Array.prototype.slice.call(root.querySelectorAll('.esol-cat-rail a'));
  var panes = Array.prototype.slice.call(root.querySelectorAll('.esol-cat-pane'));

  function open() {
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
  }
  function close() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
  }
  function toggle() {
    panel.hidden ? open() : close();
  }
  function activate(idx) {
    links.forEach(function (a, i) { a.classList.toggle('is-active', i === idx); });
    panes.forEach(function (p, i) { p.hidden = i !== idx; });
  }

  btn.addEventListener('click', toggle);

  document.addEventListener('click', function (e) {
    if (!panel.hidden && !root.contains(e.target)) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !panel.hidden) {
      close();
      btn.focus();
    }
  });

  links.forEach(function (a, i) {
    a.addEventListener('mouseenter', function () { activate(i); });
    a.addEventListener('focus', function () { activate(i); });
    a.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' && links[i + 1]) { e.preventDefault(); links[i + 1].focus(); }
      if (e.key === 'ArrowUp' && links[i - 1]) { e.preventDefault(); links[i - 1].focus(); }
    });
  });
})();
