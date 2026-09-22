document.addEventListener('click', function (e) {
  var btn = e.target.closest('[data-tab-btn]');
  if (!btn) return;
  var card = btn.closest('.filecard');
  if (!card) return;
  var tab = btn.getAttribute('data-tab-btn');
  card.querySelectorAll('[data-tab-btn]').forEach(function (b) {
    var active = b === btn;
    b.classList.toggle('active', active);
    b.setAttribute('aria-selected', active ? 'true' : 'false');
  });
  card.querySelectorAll('[data-panel]').forEach(function (p) {
    p.hidden = p.getAttribute('data-panel') !== tab;
  });
});
