document.addEventListener("DOMContentLoaded", function () {
  var toggle = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  var hero = document.querySelector("[data-hero]");

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var current = 0;
    var timer = null;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }

      timer = window.setInterval(function () {
        setSlide(current + 1);
      }, 5600);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        setSlide(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setSlide(current + 1);
        restart();
      });
    }

    restart();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function filterCards(value) {
    var query = normalize(value);
    var cards = Array.prototype.slice.call(document.querySelectorAll(".cards-root .movie-card, .ranking-list .movie-card"));

    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-title") + " " + card.getAttribute("data-tags") + " " + card.getAttribute("data-year"));
      card.classList.toggle("is-hidden", query && haystack.indexOf(query) === -1);
    });
  }

  var params = new URLSearchParams(window.location.search);
  var query = params.get("q") || "";
  var fillInput = document.querySelector("[data-query-fill]");

  if (fillInput && query) {
    fillInput.value = query;
    filterCards(query);
  }

  Array.prototype.slice.call(document.querySelectorAll("[data-card-search]")).forEach(function (input) {
    input.addEventListener("input", function () {
      filterCards(input.value);
    });
  });
});
