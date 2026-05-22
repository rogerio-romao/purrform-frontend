import PageManager from '../page-manager';

const MOBILE_MAX = 800;
const AUTOPLAY_DELAY = 10000;

export default class Fresh extends PageManager {
    onReady() {
        this.initDifferentCarousel();
        this.initBenefitsCarousel();
        this.initInsideSection();
    }

    initDifferentCarousel() {
        const carousel = document.querySelector('.fresh-different__carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.fresh-different__cards');
        const originalSlides = Array.from(track.querySelectorAll('.fresh-different__slide'));
        const slideCount = originalSlides.length;
        let currentIndex = 0;
        let perView = 1;
        let intervalId = null;
        let resizeTimer = null;

        // Append clones so the loop can wrap seamlessly
        originalSlides.forEach(s => track.appendChild(s.cloneNode(true)));

        const getPerView = () => {
            if (window.innerWidth > 1260) return 3;
            if (window.innerWidth > MOBILE_MAX) return 2;
            return 1;
        };

        const slideWidth = () => 100 / perView;

        const setTransition = (on) => {
            track.style.transition = on ? 'transform 0.4s ease' : 'none';
        };

        const goTo = (index, animate = true) => {
            currentIndex = index;
            setTransition(animate);
            track.style.transform = `translateX(-${currentIndex * slideWidth()}%)`;
        };

        // After the transition to a clone finishes, silently snap back to the real slide
        track.addEventListener('transitionend', () => {
            if (currentIndex >= slideCount) {
                goTo(currentIndex - slideCount, false);
            }
        });

        const startAutoplay = () => {
            clearInterval(intervalId);
            intervalId = setInterval(() => {
                goTo(currentIndex + 1);
            }, AUTOPLAY_DELAY);
        };

        const stopAutoplay = () => {
            clearInterval(intervalId);
            intervalId = null;
        };

        const init = () => {
            perView = getPerView();
            const allSlides = Array.from(track.querySelectorAll('.fresh-different__slide'));
            allSlides.forEach(s => { s.style.flex = `0 0 ${slideWidth()}%`; });
            // Clamp index into the real range on breakpoint change
            currentIndex = currentIndex % slideCount;
            goTo(currentIndex, false);
            clearInterval(intervalId);
            startAutoplay();
        };

        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', startAutoplay);

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(init, 150);
        });

        init();
    }

    initBenefitsCarousel() {
        const wrap = document.querySelector('.fresh-benefits__track-wrap');
        if (!wrap) return;

        const track = wrap.querySelector('.fresh-benefits__track');
        const slides = Array.from(track.querySelectorAll('.fresh-benefits__slide'));
        const prevBtn = document.querySelector('.fresh-benefits__arrow--prev');
        const nextBtn = document.querySelector('.fresh-benefits__arrow--next');
        const slideCount = slides.length;
        let currentIndex = 0;
        let perView = 1;

        const getPerView = () => {
            if (window.innerWidth > 1260) return 3;
            if (window.innerWidth > MOBILE_MAX) return 2;
            return 1;
        };

        const maxIndex = () => slideCount - perView;

        const updateArrows = () => {
            prevBtn.disabled = currentIndex === 0;
            nextBtn.disabled = currentIndex >= maxIndex();
        };

        const goTo = (index) => {
            currentIndex = Math.max(0, Math.min(index, maxIndex()));
            track.style.transform = `translateX(-${currentIndex * (100 / perView)}%)`;
            updateArrows();
        };

        const init = () => {
            perView = getPerView();
            slides.forEach(s => { s.style.flex = `0 0 ${100 / perView}%`; });
            goTo(Math.min(currentIndex, maxIndex()));
        };

        prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
        nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

        let resizeTimer = null;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(init, 150);
        });

        init();
    }

    initInsideSection() {
        const section = document.querySelector('.fresh-inside');
        if (!section) return;

        const pluses = Array.from(section.querySelectorAll('.fresh-inside__plus'));
        const cards = Array.from(section.querySelectorAll('.fresh-inside__card'));
        if (!pluses.length || !cards.length) return;

        const show = (targetId) => {
            cards.forEach(c => c.classList.toggle('is-visible', c.dataset.card === targetId));
            pluses.forEach(p => p.classList.toggle('is-active', p.dataset.target === targetId));
        };

        pluses.forEach(p => {
            p.addEventListener('click', () => show(p.dataset.target));
        });

        show(pluses[0].dataset.target);
    }
}
