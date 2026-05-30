(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setHero(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setHero(index);
      });
    });

    window.setInterval(function () {
      setHero(current + 1);
    }, 5600);
  }

  function normalize(value) {
    return (value || '').toString().trim().toLowerCase();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
  var grids = Array.prototype.slice.call(document.querySelectorAll('[data-searchable]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
  var selectedCategory = 'all';

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get('search') || '';
  }

  function updateCards() {
    var query = normalize(searchInputs.map(function (input) {
      return input.value;
    }).filter(Boolean)[0] || '');

    grids.forEach(function (grid) {
      Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]')).forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-year'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' '));
        var category = card.getAttribute('data-category') || '';
        var categoryMatched = selectedCategory === 'all' || category === selectedCategory;
        var queryMatched = !query || haystack.indexOf(query) >= 0;
        card.classList.toggle('is-hidden', !(categoryMatched && queryMatched));
      });
    });
  }

  if (searchInputs.length) {
    var initialQuery = getQueryValue();
    searchInputs.forEach(function (input) {
      if (initialQuery && !input.value) {
        input.value = initialQuery;
      }
      input.addEventListener('input', updateCards);
    });
    updateCards();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      selectedCategory = button.getAttribute('data-filter-value') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      updateCards();
    });
  });
})();

function initPlayer(streamUrl) {
  var video = document.getElementById('movie-player');
  var startButton = document.getElementById('player-start');
  var isReady = false;
  var hlsInstance = null;

  if (!video || !startButton || !streamUrl) {
    return;
  }

  function attachStream() {
    if (isReady) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      isReady = true;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      isReady = true;
      return;
    }

    video.src = streamUrl;
    isReady = true;
  }

  function startPlayback() {
    attachStream();
    startButton.classList.add('is-hidden');
    var action = video.play();
    if (action && typeof action.catch === 'function') {
      action.catch(function () {
        startButton.classList.remove('is-hidden');
      });
    }
  }

  startButton.addEventListener('click', startPlayback);
  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });
  video.addEventListener('play', function () {
    startButton.classList.add('is-hidden');
  });
  video.addEventListener('pause', function () {
    if (!video.ended) {
      startButton.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
