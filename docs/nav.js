(function () {
  var here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('nav.toc a[data-page]').forEach(function (a) {
    if (a.getAttribute('data-page') === here) {
      a.classList.add('active');
    }
  });
})();
