import PageManager from '../page-manager';

const MOBILE_MAX = 800;
const AUTOPLAY_DELAY = 4000;

export default class Fresh extends PageManager {
    onReady() {
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
}
