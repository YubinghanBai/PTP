document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.carousel-container');
    const slidesContainer = carousel.querySelector('.carousel-slides');
    const slides = Array.from(slidesContainer.children); // Original slides
    const prevButton = carousel.querySelector('.carousel-arrow.prev');
    const nextButton = carousel.querySelector('.carousel-arrow.next');
    const dotsContainer = carousel.querySelector('.carousel-dots');
    const footerMask = carousel.querySelector('.carousel-footer-mask');
    const footerTitleLink = carousel.querySelector('.carousel-footer-title-link');
    const footerTitleSpan = carousel.querySelector('.carousel-footer-title');

    if (!slides.length) return; // Exit if no slides

    const slideCount = slides.length;
    let currentIndex = 0; // Index of the *original* slide being shown
    let isTransitioning = false;
    let autoPlayInterval = null;
    const autoPlayDelay = 5000; // 5 seconds

    // --- Infinite Loop Setup ---
    // Clone first and last slides
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slideCount - 1].cloneNode(true);

    // Add clones to the container
    slidesContainer.appendChild(firstClone);
    slidesContainer.insertBefore(lastClone, slides[0]);

    // Update slides array to include clones for positioning calculations
    const allSlides = Array.from(slidesContainer.children);
    const totalSlidesIncludingClones = allSlides.length;

    // Initial position: Show the first *original* slide (which is now at index 1)
    slidesContainer.style.transform = `translateX(-${100}%)`;

    // --- Create Dots ---
    slides.forEach((_, index) => {
        const dot = document.createElement('button');
        dot.classList.add('carousel-dots-dot');
        dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
        dot.addEventListener('click', () => {
            if (isTransitioning) return;
            goToSlide(index);
            resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
    });
    const dots = Array.from(dotsContainer.children);

    // --- Update UI Function ---
    const updateUI = (logicalIndex) => {
        // Update Dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('is-active', index === logicalIndex);
        });

        // Update Footer
        const currentOriginalSlide = slides[logicalIndex];
        const title = currentOriginalSlide.dataset.title || '';
        const color = currentOriginalSlide.dataset.color || 'rgba(0, 0, 0, 0.7)'; // Default color
        const link = currentOriginalSlide.dataset.link || '#';

        footerTitleSpan.textContent = title;
        footerTitleLink.href = link;
        // Apply color to the mask - using background-color adds it on top of the gradient
        footerMask.style.backgroundColor = color;
    };

    // --- Go To Slide Function ---
    const goToSlide = (index) => { // index here refers to the *logical* index (0 to slideCount - 1)
        if (isTransitioning) return;
        isTransitioning = true;

        currentIndex = index; // Update logical index
        const targetTranslateX = -(currentIndex + 1) * 100; // +1 because of the prepended clone

        slidesContainer.style.transition = `transform var(--carousel-transition-duration) ease`;
        slidesContainer.style.transform = `translateX(${targetTranslateX}%)`;

        updateUI(currentIndex);
    };

    // --- Handle Infinite Loop Transition End ---
    slidesContainer.addEventListener('transitionend', () => {
        isTransitioning = false;

        // If we landed on the last clone (visually), jump to the first real slide
        if (currentIndex === slideCount) { // This condition might need adjustment based on exact behavior
            slidesContainer.classList.add('no-transition');
            slidesContainer.style.transform = `translateX(-100%)`; // Position of the first *real* slide
            currentIndex = 0;
            // Force reflow before removing the class to ensure the jump happens instantly
             void slidesContainer.offsetWidth;
            slidesContainer.classList.remove('no-transition');
             updateUI(currentIndex); // Update UI after jump
        }
        // If we landed on the first clone (visually), jump to the last real slide
        else if (currentIndex === -1) { // This condition might need adjustment
            slidesContainer.classList.add('no-transition');
            slidesContainer.style.transform = `translateX(-${slideCount * 100}%)`; // Position of the last *real* slide
            currentIndex = slideCount - 1;
             void slidesContainer.offsetWidth;
            slidesContainer.classList.remove('no-transition');
             updateUI(currentIndex); // Update UI after jump
        }
         // In the standard case, the currentIndex is already correct (0 to slideCount-1)
         // and the transform is correct, so nothing else needed here after transition.
    });

    // --- Arrow Navigation ---
    nextButton.addEventListener('click', () => {
        if (isTransitioning) return;
        let nextIndex = currentIndex + 1;
         // Logic for infinite loop jump check *before* starting transition
         // If currently on the last slide, the next visual slide is the *clone* of the first.
         // We let the transition happen to the clone, and the transitionend handles the jump.
        goToSlide(nextIndex > slideCount - 1 ? slideCount : nextIndex); // Target the clone if needed
        resetAutoPlay();
    });

    prevButton.addEventListener('click', () => {
        if (isTransitioning) return;
        let prevIndex = currentIndex - 1;
         // Logic for infinite loop jump check *before* starting transition
         // If currently on the first slide, the next visual slide is the *clone* of the last.
        goToSlide(prevIndex < 0 ? -1 : prevIndex); // Target the clone if needed
        resetAutoPlay();
    });

    // --- Autoplay ---
    const startAutoPlay = () => {
        if (autoPlayInterval) clearInterval(autoPlayInterval); // Clear existing interval
        autoPlayInterval = setInterval(() => {
            nextButton.click(); // Simulate clicking next
        }, autoPlayDelay);
    };

    const stopAutoPlay = () => {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
    };

    const resetAutoPlay = () => {
        stopAutoPlay();
        startAutoPlay();
    };

    // Pause on hover
    carousel.addEventListener('mouseenter', stopAutoPlay);
    carousel.addEventListener('mouseleave', startAutoPlay);

    // --- Initialize ---
    updateUI(currentIndex); // Set initial footer/dots
    startAutoPlay(); // Start sliding

});