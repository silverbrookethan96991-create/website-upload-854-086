(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  function initMenu() {
    var header = document.querySelector('.site-header');
    var button = document.querySelector('.menu-toggle');
    if (!header || !button) {
      return;
    }
    button.addEventListener('click', function() {
      header.classList.toggle('nav-open');
    });
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      slides[index].classList.remove('active');
      if (dots[index]) {
        dots[index].classList.remove('active');
      }
      index = (next + slides.length) % slides.length;
      slides[index].classList.add('active');
      if (dots[index]) {
        dots[index].classList.add('active');
      }
    }
    function start() {
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5600);
    }
    dots.forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        window.clearInterval(timer);
        show(i);
        start();
      });
    });
    start();
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  function filterCards(input, grid, extraSelect) {
    var query = normalize(input.value);
    var selected = extraSelect ? normalize(extraSelect.value) : '';
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
    var shown = 0;
    cards.forEach(function(card) {
      var text = normalize(card.getAttribute('data-search') || card.textContent);
      var category = normalize(card.getAttribute('data-category') || '');
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchSelect = !selected || category === selected || text.indexOf(selected) !== -1;
      var visible = matchQuery && matchSelect;
      card.style.display = visible ? '' : 'none';
      if (visible) {
        shown += 1;
      }
    });
    var empty = document.querySelector('[data-empty-state]');
    if (empty) {
      empty.classList.toggle('show', shown === 0);
    }
  }

  function initFilters() {
    var filterInputs = Array.prototype.slice.call(document.querySelectorAll('[data-filter-input]'));
    filterInputs.forEach(function(input) {
      var grid = document.querySelector(input.getAttribute('data-filter-input'));
      if (!grid) {
        return;
      }
      input.addEventListener('input', function() {
        filterCards(input, grid, null);
      });
    });

    var searchInput = document.querySelector('[data-search-query]');
    var searchGrid = document.querySelector('[data-search-grid]');
    var searchSelect = document.querySelector('[data-search-category]');
    if (searchInput && searchGrid) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (query) {
        searchInput.value = query;
      }
      var run = function() {
        filterCards(searchInput, searchGrid, searchSelect);
      };
      searchInput.addEventListener('input', run);
      if (searchSelect) {
        searchSelect.addEventListener('change', run);
      }
      run();
    }
  }

  function initPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('[data-stream]'));
    shells.forEach(function(shell) {
      var video = shell.querySelector('video');
      var cover = shell.querySelector('.play-cover');
      var stream = shell.getAttribute('data-stream');
      var hlsInstance = null;
      var loaded = false;
      if (!video || !cover || !stream) {
        return;
      }
      function load() {
        if (!loaded) {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = stream;
          } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({ enableWorker: true });
            hlsInstance.loadSource(stream);
            hlsInstance.attachMedia(video);
          } else {
            video.src = stream;
          }
          loaded = true;
        }
      }
      function play() {
        load();
        cover.classList.add('is-hidden');
        var result = video.play();
        if (result && typeof result.catch === 'function') {
          result.catch(function() {
            cover.classList.remove('is-hidden');
          });
        }
      }
      cover.addEventListener('click', play);
      video.addEventListener('click', function() {
        if (!loaded) {
          play();
        }
      });
      window.addEventListener('pagehide', function() {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  ready(function() {
    initMenu();
    initHero();
    initFilters();
    initPlayers();
  });
})();
