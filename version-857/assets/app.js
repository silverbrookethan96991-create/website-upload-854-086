(function () {
    function findAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-nav]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('open');
            button.textContent = menu.classList.contains('open') ? '×' : '☰';
        });
    }

    function setupSearch() {
        var params = new URLSearchParams(window.location.search);
        var term = (params.get('search') || '').trim();
        findAll('.search-form input[name="search"]').forEach(function (input) {
            input.value = term;
        });
        if (!term) {
            return;
        }
        var normalized = term.toLowerCase();
        var cards = findAll('.movie-card');
        if (!cards.length) {
            return;
        }
        var visible = 0;
        cards.forEach(function (card) {
            var haystack = (card.getAttribute('data-search') || card.textContent || '').toLowerCase();
            var matched = haystack.indexOf(normalized) !== -1;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });
        var title = document.querySelector('[data-search-title]');
        if (title) {
            title.textContent = '搜索结果：' + term;
        }
        var empty = document.querySelector('[data-search-empty]');
        if (empty) {
            empty.classList.toggle('show', visible === 0);
        }
    }

    function setupHero() {
        var root = document.querySelector('[data-hero-slider]');
        if (!root) {
            return;
        }
        var slides = findAll('[data-hero-slide]', root);
        var dots = findAll('[data-hero-dot]', root);
        var previous = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        if (!slides.length) {
            return;
        }
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
            });
        }

        function run() {
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            run();
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        if (previous) {
            previous.addEventListener('click', function () {
                show(index - 1);
                restart();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                restart();
            });
        }
        show(0);
        run();
    }

    window.initMoviePlayer = function (streamUrl) {
        var shell = document.querySelector('[data-player]');
        if (!shell) {
            return;
        }
        var video = shell.querySelector('video');
        var overlay = shell.querySelector('[data-player-start]');
        var playButton = shell.querySelector('[data-player-play]');
        var muteButton = shell.querySelector('[data-player-mute]');
        var fullButton = shell.querySelector('[data-player-full]');
        var hls = null;
        var attached = false;

        function attachStream() {
            if (attached || !video || !streamUrl) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.ERROR, function (_, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                    } else {
                        hls.destroy();
                    }
                });
            } else {
                video.src = streamUrl;
            }
        }

        function markPlaying() {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (playButton) {
                playButton.textContent = '❚❚';
            }
        }

        function markPaused() {
            if (playButton) {
                playButton.textContent = '▶';
            }
        }

        function start() {
            attachStream();
            if (!video) {
                return;
            }
            video.play().then(markPlaying).catch(function () {
                markPlaying();
            });
        }

        function toggle() {
            if (!video) {
                return;
            }
            if (!attached || video.paused) {
                start();
            } else {
                video.pause();
                markPaused();
            }
        }

        if (overlay) {
            overlay.addEventListener('click', start);
        }
        if (playButton) {
            playButton.addEventListener('click', toggle);
        }
        if (video) {
            video.addEventListener('click', toggle);
            video.addEventListener('play', markPlaying);
            video.addEventListener('pause', markPaused);
        }
        if (muteButton && video) {
            muteButton.addEventListener('click', function () {
                video.muted = !video.muted;
                muteButton.textContent = video.muted ? '🔇' : '🔊';
            });
        }
        if (fullButton && shell) {
            fullButton.addEventListener('click', function () {
                if (document.fullscreenElement) {
                    document.exitFullscreen();
                } else if (shell.requestFullscreen) {
                    shell.requestFullscreen();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupSearch();
        setupHero();
    });
})();
