(function() {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }

  ready(function() {
    var toggle = document.querySelector('.menu-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function() {
        var open = mobileNav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    function setSlide(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        setSlide(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function() {
        setSlide(current + 1);
      }, 5600);
    }

    var params = new URLSearchParams(window.location.search);
    var queryValue = params.get('q') || params.get('search') || '';
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
    var categoryFilter = document.querySelector('[data-category-filter]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var lists = Array.prototype.slice.call(document.querySelectorAll('[data-search-list]'));

    if (queryValue && searchInputs.length) {
      searchInputs.forEach(function(input) {
        input.value = queryValue;
      });
      var library = document.getElementById('library');
      if (library) {
        setTimeout(function() {
          library.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 80);
      }
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(searchInputs[0] ? searchInputs[0].value : '');
      var category = categoryFilter ? categoryFilter.value : '';
      var year = yearFilter ? yearFilter.value : '';
      lists.forEach(function(list) {
        var cards = Array.prototype.slice.call(list.querySelectorAll('.searchable-card'));
        cards.forEach(function(card) {
          var text = normalize(card.getAttribute('data-text') || card.textContent);
          var title = normalize(card.getAttribute('data-title'));
          var cardCategory = card.getAttribute('data-category') || '';
          var cardYear = card.getAttribute('data-year') || '';
          var matchQuery = !query || text.indexOf(query) !== -1 || title.indexOf(query) !== -1;
          var matchCategory = !category || cardCategory === category;
          var matchYear = !year || cardYear === year;
          card.classList.toggle('is-hidden', !(matchQuery && matchCategory && matchYear));
        });
      });
    }

    searchInputs.forEach(function(input) {
      input.addEventListener('input', applyFilter);
    });
    if (categoryFilter) {
      categoryFilter.addEventListener('change', applyFilter);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', applyFilter);
    }
    applyFilter();
  });
})();
