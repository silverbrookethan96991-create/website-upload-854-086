(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    qsa('img').forEach(function (img) {
        img.addEventListener('error', function () {
            img.classList.add('image-missing');
        });
    });

    var toggle = qs('.menu-toggle');
    var panel = qs('.mobile-panel');
    if (toggle && panel) {
        toggle.addEventListener('click', function () {
            var open = panel.hasAttribute('hidden');
            if (open) {
                panel.removeAttribute('hidden');
            } else {
                panel.setAttribute('hidden', '');
            }
            toggle.setAttribute('aria-expanded', String(open));
        });
    }

    var slides = qsa('[data-hero-slide]');
    var dots = qsa('[data-hero-dot]');
    var heroIndex = 0;
    function showHero(index) {
        if (!slides.length) {
            return;
        }
        heroIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === heroIndex);
        });
        dots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === heroIndex);
        });
    }
    dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            showHero(Number(dot.getAttribute('data-hero-dot')) || 0);
        });
    });
    if (slides.length > 1) {
        setInterval(function () {
            showHero(heroIndex + 1);
        }, 5200);
    }

    var searchInputs = [qs('#page-search'), qs('#search-page-input')].filter(Boolean);
    var cards = qsa('[data-movie-card]');
    var filterButtons = qsa('[data-filter]');
    var activeFilter = 'all';

    function normalize(text) {
        return String(text || '').trim().toLowerCase();
    }

    function currentQuery() {
        var input = searchInputs[0];
        return input ? normalize(input.value) : '';
    }

    function applyFilters() {
        if (!cards.length) {
            return;
        }
        var query = currentQuery();
        cards.forEach(function (card) {
            var keywords = normalize(card.getAttribute('data-keywords'));
            var category = card.getAttribute('data-category');
            var matchesText = !query || keywords.indexOf(query) !== -1;
            var matchesFilter = activeFilter === 'all' || category === activeFilter;
            card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
        });
    }

    searchInputs.forEach(function (input) {
        input.addEventListener('input', applyFilters);
    });

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activeFilter = button.getAttribute('data-filter') || 'all';
            filterButtons.forEach(function (item) {
                item.classList.toggle('active', item === button);
            });
            applyFilters();
        });
    });

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q');
    if (query && searchInputs.length) {
        searchInputs.forEach(function (input) {
            input.value = query;
        });
        applyFilters();
    }

    var player = qs('[data-player]');
    if (player) {
        var video = qs('video', player);
        var overlay = qs('.player-overlay', player);
        var source = player.getAttribute('data-video');
        var hlsInstance = null;

        function attachVideo() {
            if (!video || !source || video.getAttribute('data-ready') === '1') {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }
            video.setAttribute('data-ready', '1');
        }

        function beginPlay() {
            attachVideo();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                var result = video.play();
                if (result && typeof result.catch === 'function') {
                    result.catch(function () {});
                }
            }
        }

        if (overlay) {
            overlay.addEventListener('click', beginPlay);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    beginPlay();
                }
            });
            video.addEventListener('play', function () {
                if (overlay) {
                    overlay.classList.add('is-hidden');
                }
            });
        }
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }
})();
