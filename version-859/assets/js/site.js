(() => {
    const toggle = document.querySelector(".mobile-toggle");
    const panel = document.querySelector(".mobile-panel");

    if (toggle && panel) {
        toggle.addEventListener("click", () => {
            const expanded = toggle.getAttribute("aria-expanded") === "true";
            toggle.setAttribute("aria-expanded", String(!expanded));
            panel.hidden = expanded;
        });
    }

    document.querySelectorAll("img").forEach((image) => {
        image.addEventListener("error", () => {
            image.classList.add("image-missing");
        });
    });

    const slides = Array.from(document.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(document.querySelectorAll("[data-hero-dot]"));
    const prev = document.querySelector("[data-hero-prev]");
    const next = document.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach((slide, slideIndex) => {
            slide.classList.toggle("is-active", slideIndex === current);
        });
        dots.forEach((dot, dotIndex) => {
            dot.classList.toggle("is-active", dotIndex === current);
        });
    }

    function startHero() {
        if (timer || slides.length < 2) {
            return;
        }
        timer = window.setInterval(() => showSlide(current + 1), 5200);
    }

    function resetHero() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startHero();
    }

    dots.forEach((dot) => {
        dot.addEventListener("click", () => {
            showSlide(Number(dot.dataset.heroDot));
            resetHero();
        });
    });

    if (prev) {
        prev.addEventListener("click", () => {
            showSlide(current - 1);
            resetHero();
        });
    }

    if (next) {
        next.addEventListener("click", () => {
            showSlide(current + 1);
            resetHero();
        });
    }

    showSlide(0);
    startHero();

    const searchInputs = Array.from(document.querySelectorAll("[data-page-search]"));
    const grids = Array.from(document.querySelectorAll(".searchable-grid"));
    const filterButtons = Array.from(document.querySelectorAll("[data-filter-year], [data-filter-type]"));
    const params = new URLSearchParams(window.location.search);
    const query = params.get("q") || "";
    let activeYear = "all";
    let activeType = "all";

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function applyFilters() {
        const keyword = normalize(searchInputs[0] ? searchInputs[0].value : query);
        grids.forEach((grid) => {
            Array.from(grid.querySelectorAll(".movie-card")).forEach((card) => {
                const text = normalize(card.dataset.search);
                const year = card.dataset.year || "";
                const type = card.dataset.type || "";
                const keywordMatch = !keyword || text.includes(keyword);
                const yearMatch = activeYear === "all" || year === activeYear;
                const typeMatch = activeType === "all" || type.includes(activeType);
                card.classList.toggle("is-filtered-out", !(keywordMatch && yearMatch && typeMatch));
            });
        });
    }

    if (query && searchInputs.length) {
        searchInputs.forEach((input) => {
            input.value = query;
        });
    }

    searchInputs.forEach((input) => {
        input.addEventListener("input", applyFilters);
    });

    filterButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const isYear = Object.prototype.hasOwnProperty.call(button.dataset, "filterYear");
            const isType = Object.prototype.hasOwnProperty.call(button.dataset, "filterType");
            if (isYear) {
                activeYear = button.dataset.filterYear || "all";
                document.querySelectorAll("[data-filter-year]").forEach((item) => item.classList.remove("is-active"));
                button.classList.add("is-active");
            }
            if (isType) {
                activeType = button.classList.contains("is-active") ? "all" : button.dataset.filterType;
                document.querySelectorAll("[data-filter-type]").forEach((item) => item.classList.remove("is-active"));
                if (activeType !== "all") {
                    button.classList.add("is-active");
                }
            }
            applyFilters();
        });
    });

    applyFilters();
})();
