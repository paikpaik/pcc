(function () {
  var links = document.querySelectorAll('.subnav-link');
  if (!links.length) return;

  var sections = {};
  document.querySelectorAll('main .file-section[id]').forEach(function (s) {
    sections[s.id] = s;
  });

  function activate(id, updateHash) {
    if (!sections[id]) return;
    links.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('data-file') === id);
    });
    Object.keys(sections).forEach(function (key) {
      sections[key].hidden = key !== id;
    });
    if (updateHash && window.history && history.replaceState) {
      history.replaceState(null, '', '#' + id);
    }
  }

  links.forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      activate(a.getAttribute('data-file'), true);
    });
  });

  var initial = (location.hash || '').slice(1);
  if (!sections[initial]) {
    initial = links[0].getAttribute('data-file');
  }
  activate(initial, false);
})();
