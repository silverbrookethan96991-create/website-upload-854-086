(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function () {
    var toggle = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = panel.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var hero = document.querySelector('[data-hero-slider]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var current = 0;
      var show = function (index) {
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('active', i === current);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('active', i === current);
        });
      };
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
        });
      });
      if (slides.length > 1) {
        setInterval(function () {
          show(current + 1);
        }, 5600);
      }
    }

    var filterRoot = document.querySelector('[data-filter-root]');
    if (filterRoot) {
      var input = filterRoot.querySelector('[data-filter-input]');
      var year = filterRoot.querySelector('[data-filter-year]');
      var type = filterRoot.querySelector('[data-filter-type]');
      var cards = Array.prototype.slice.call(filterRoot.querySelectorAll('.movie-card'));
      var apply = function () {
        var q = input ? input.value.trim().toLowerCase() : '';
        var y = year ? year.value : '';
        var t = type ? type.value.toLowerCase() : '';
        cards.forEach(function (card) {
          var text = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-type') || ''
          ].join(' ');
          var ok = (!q || text.indexOf(q) !== -1) && (!y || card.getAttribute('data-year') === y) && (!t || (card.getAttribute('data-type') || '').indexOf(t) !== -1);
          card.style.display = ok ? '' : 'none';
        });
      };
      [input, year, type].forEach(function (el) {
        if (el) {
          el.addEventListener('input', apply);
          el.addEventListener('change', apply);
        }
      });
    }

    var searchRoot = document.querySelector('[data-search-page]');
    if (searchRoot && window.SEARCH_INDEX) {
      var params = new URLSearchParams(window.location.search);
      var qInput = searchRoot.querySelector('[name="q"]');
      var results = searchRoot.querySelector('[data-search-results]');
      var empty = searchRoot.querySelector('[data-empty-state]');
      var initial = params.get('q') || '';
      if (qInput) {
        qInput.value = initial;
      }
      var render = function () {
        var q = qInput ? qInput.value.trim().toLowerCase() : '';
        var list = window.SEARCH_INDEX.filter(function (item) {
          if (!q) {
            return item.hot;
          }
          return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine].join(' ').toLowerCase().indexOf(q) !== -1;
        }).slice(0, q ? 80 : 24);
        results.innerHTML = list.map(function (item) {
          return '<a class="movie-card" href="' + item.url + '" data-title="' + escapeHtml(item.title.toLowerCase()) + '">' +
            '<div class="poster-wrap"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy"><span class="poster-mask"></span><span class="card-category">' + escapeHtml(item.category) + '</span><span class="card-score">★ ' + item.rating + '</span><span class="play-chip">▶</span></div>' +
            '<div class="movie-card-body"><h3>' + escapeHtml(item.title) + '</h3><p>' + escapeHtml(item.oneLine) + '</p><div class="meta-line"><span>' + escapeHtml(item.year) + '</span><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div><div class="tag-line"><span>' + escapeHtml(item.genre) + '</span></div></div>' +
            '</a>';
        }).join('');
        if (empty) {
          empty.style.display = list.length ? 'none' : 'block';
        }
      };
      if (qInput) {
        qInput.addEventListener('input', render);
      }
      render();
    }
  });

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (ch) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[ch];
    });
  }

  window.initMoviePlayer = function (sourceUrl) {
    var video = document.getElementById('movieVideo');
    var cover = document.querySelector('.player-cover');
    var start = document.querySelector('.player-start');
    var hls = null;
    var loaded = false;
    var load = function () {
      if (!video || loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          }
        });
      } else {
        video.src = sourceUrl;
      }
    };
    var play = function () {
      load();
      if (cover) {
        cover.classList.add('is-hidden');
      }
      var promise = video.play();
      if (promise && promise.catch) {
        promise.catch(function () {});
      }
    };
    if (start) {
      start.addEventListener('click', play);
    }
    if (cover) {
      cover.addEventListener('click', play);
    }
    if (video) {
      video.addEventListener('play', function () {
        if (cover) {
          cover.classList.add('is-hidden');
        }
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
