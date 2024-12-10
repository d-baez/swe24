let slideIndex = 1; // Start with the first slide
    showSlide(slideIndex);

    // Change slide when navigating back or forth
    function changeSlide(n) {
      showSlide(slideIndex += n);
    }

    // Show a specific slide based on dot click
    function currentSlide(n) {
      showSlide(slideIndex = n);
    }

    // Main function to display the slides
    function showSlide(n) {
      const slides = document.getElementsByClassName('slide');
      const dots = document.getElementsByClassName('dot');

      // Loop around if the index goes out of range
      if (n > slides.length) { slideIndex = 1; }
      if (n < 1) { slideIndex = slides.length; }

      // Hide all slides
      for (let slide of slides) {
        slide.style.display = 'none';
      }

      // Remove the 'active' class from all dots
      for (let dot of dots) {
        dot.className = dot.className.replace(' active', '');
      }

      // Show the current slide and highlight the corresponding dot
      slides[slideIndex - 1].style.display = 'block';
      dots[slideIndex - 1].className += ' active';
    }