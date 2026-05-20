import PageManager from '../page-manager';

const MOBILE_MAX = 800;
const AUTOPLAY_DELAY = 10000;

export default class Fresh extends PageManager {
    onReady() {
        this.initDifferentCarousel();
        this.initBenefitsCarousel();
    }

    initDifferentCarousel() {
        const carousel = document.querySelector('.fresh-different__carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.fresh-different__cards');
        const cards = Array.from(carousel.querySelectorAll('.fresh-different__slide'));
        const dots = Array.from(carousel.querySelectorAll('.fresh-different__dot'));
        const slideCount = cards.length;
        let currentIndex = 0;
        let intervalId = null;
        let resizeTimer = null;

        const isMobile = () => window.innerWidth <= MOBILE_MAX;

        const goTo = (index) => {
            currentIndex = index;
            track.style.transform = `translateX(-${index * 100}%)`;
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
        };

        const startAutoplay = () => {
            clearInterval(intervalId);
            intervalId = setInterval(() => {
                goTo((currentIndex + 1) % slideCount);
            }, AUTOPLAY_DELAY);
        };

        const stopAutoplay = () => {
            clearInterval(intervalId);
            intervalId = null;
        };

        const resetAutoplay = () => {
            stopAutoplay();
            startAutoplay();
        };

        const initCarousel = () => {
            goTo(0);
            startAutoplay();
        };

        const destroyCarousel = () => {
            stopAutoplay();
            track.style.transform = '';
            dots.forEach((dot, i) => dot.classList.toggle('is-active', i === 0));
        };

        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                if (!isMobile()) return;
                goTo(i);
                resetAutoplay();
            });
        });

        carousel.addEventListener('mouseenter', () => { if (isMobile()) stopAutoplay(); });
        carousel.addEventListener('mouseleave', () => { if (isMobile()) startAutoplay(); });

        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (isMobile()) {
                    initCarousel();
                } else {
                    destroyCarousel();
                }
            }, 150);
        });

        if (isMobile()) initCarousel();
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
}
