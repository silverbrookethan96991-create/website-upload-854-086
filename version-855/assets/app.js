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
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function showSlide(index) {
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

        function startHero() {
            clearInterval(timer);
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                startHero();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                startHero();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                startHero();
            });
        }

        startHero();
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function applyFilters(root) {
        var input = root.querySelector('[data-search-input]');
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
        var query = normalize(input ? input.value : '');
        var selects = Array.prototype.slice.call(root.querySelectorAll('[data-filter-select]'));

        cards.forEach(function (card) {
            var searchable = normalize(card.innerText + ' ' + card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags'));
            var matched = !query || searchable.indexOf(query) !== -1;

            selects.forEach(function (select) {
                var key = select.getAttribute('data-filter-select');
                var value = normalize(select.value);

                if (value && normalize(card.getAttribute('data-' + key)) !== value) {
                    matched = false;
                }
            });

            card.classList.toggle('is-hidden', !matched);
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]')).forEach(function (root) {
        var queryValue = new URLSearchParams(window.location.search).get('q');
        var input = root.querySelector('[data-search-input]');

        if (input && queryValue) {
            input.value = queryValue;
        }

        root.addEventListener('input', function () {
            applyFilters(root);
        });

        root.addEventListener('change', function () {
            applyFilters(root);
        });

        applyFilters(root);
    });

    function activatePlayer(shell) {
        var video = shell.querySelector('video');
        var source = shell.getAttribute('data-video-url');

        if (!video || !source) {
            return;
        }

        shell.classList.add('is-playing');

        if (video.getAttribute('data-ready') !== '1') {
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({ enableWorker: true });
                hls.loadSource(source);
                hls.attachMedia(video);
                shell._hls = hls;
            } else {
                video.src = source;
            }

            video.setAttribute('data-ready', '1');
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
        var button = shell.querySelector('[data-play]');
        var video = shell.querySelector('video');

        if (button) {
            button.addEventListener('click', function () {
                activatePlayer(shell);
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    activatePlayer(shell);
                }
            });
        }
    });
})();
