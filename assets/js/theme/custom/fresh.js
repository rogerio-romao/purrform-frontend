/* eslint-disable no-param-reassign */
import PageManager from '../page-manager';

const MOBILE_MAX = 800;
const AUTOPLAY_DELAY = 10000;
const LIFESTYLE_AUTOPLAY_DELAY = 4000;
// BST (+01:00) — 16 June 2026 at midnight London time
const LAUNCH_DATE = new Date('2026-06-16T09:00:00+01:00');

export default class Fresh extends PageManager {
    onReady() {
        this.initCountdown();
        this.initDifferentCarousel();
        this.initLifestyleCarousel();
        this.initBenefitsCarousel();
        this.initInsideSection();
        this.initFaqAnimation();
    }

    initCountdown() {
        let intervalId = null;
        const countdown = document.querySelector('.fresh-countdown');
        if (!countdown) return;

        const cta = document.querySelector('.fresh-hero__cta');

        const pad = (n) => String(Math.floor(n)).padStart(2, '0');

        const tick = () => {
            const diff = LAUNCH_DATE - Date.now();

            if (diff <= 0) {
                clearInterval(intervalId);
                countdown.hidden = true;
                if (cta) cta.textContent = 'Launching now — shop Fresh';
                return;
            }

            const totalSeconds = diff / 1000;
            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = Math.floor(totalSeconds % 60);

            countdown.querySelector('[data-unit="days"]').textContent =
                pad(days);
            countdown.querySelector('[data-unit="hours"]').textContent =
                pad(hours);
            countdown.querySelector('[data-unit="minutes"]').textContent =
                pad(minutes);
            countdown.querySelector('[data-unit="seconds"]').textContent =
                pad(seconds);
        };

        tick();
        intervalId = setInterval(tick, 1000);
    }

    initDifferentCarousel() {
        const carousel = document.querySelector('.fresh-different__carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.fresh-different__cards');
        const originalSlides = Array.from(
            track.querySelectorAll('.fresh-different__slide'),
        );
        const slideCount = originalSlides.length;
        let currentIndex = 0;
        let perView = 1;
        let intervalId = null;
        let resizeTimer = null;

        // Append clones so the loop can wrap seamlessly
        originalSlides.forEach((s) => track.appendChild(s.cloneNode(true)));

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
            // Wrap into the clone range [0, slideCount*2) so translateX is always valid
            currentIndex =
                ((index % (slideCount * 2)) + slideCount * 2) %
                (slideCount * 2);
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
            const allSlides = Array.from(
                track.querySelectorAll('.fresh-different__slide'),
            );
            allSlides.forEach((s) => {
                s.style.flex = `0 0 ${slideWidth()}%`;
            });
            // Clamp index into the real range on breakpoint change
            currentIndex %= slideCount;
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

    initLifestyleCarousel() {
        const carousel = document.querySelector('.fresh-lifestyle__carousel');
        if (!carousel) return;

        const track = carousel.querySelector('.fresh-lifestyle__cards');
        const originalSlides = Array.from(
            track.querySelectorAll('.fresh-lifestyle__slide'),
        );
        const slideCount = originalSlides.length;
        let currentIndex = 0;
        let perView = 1;
        let intervalId = null;
        let resizeTimer = null;
        let clonesAdded = false;

        const getPerView = () => {
            if (window.innerWidth > 1260) return 4;
            if (window.innerWidth > 900) return 3;
            if (window.innerWidth > 600) return 2;
            return 1;
        };

        const slideWidth = () => 100 / perView;

        const setTransition = (on) => {
            track.style.transition = on ? 'transform 0.6s ease' : 'none';
        };

        const goTo = (index, animate = true) => {
            currentIndex =
                ((index % (slideCount * 2)) + slideCount * 2) %
                (slideCount * 2);
            setTransition(animate);
            track.style.transform = `translateX(-${currentIndex * slideWidth()}%)`;
        };

        track.addEventListener('transitionend', () => {
            if (currentIndex >= slideCount) {
                goTo(currentIndex - slideCount, false);
            }
        });

        const startAutoplay = () => {
            clearInterval(intervalId);
            intervalId = setInterval(() => {
                goTo(currentIndex + 1);
            }, LIFESTYLE_AUTOPLAY_DELAY);
        };

        const stopAutoplay = () => {
            clearInterval(intervalId);
            intervalId = null;
        };

        const ensureClones = () => {
            if (clonesAdded) return;
            originalSlides.forEach((s) => track.appendChild(s.cloneNode(true)));
            clonesAdded = true;
        };

        const init = () => {
            perView = getPerView();
            const allFitOnScreen = perView >= slideCount;

            const allSlides = Array.from(
                track.querySelectorAll('.fresh-lifestyle__slide'),
            );
            allSlides.forEach((s) => {
                s.style.flex = `0 0 ${slideWidth()}%`;
            });

            if (allFitOnScreen) {
                stopAutoplay();
                currentIndex = 0;
                setTransition(false);
                track.style.transform = 'translateX(0)';
                return;
            }

            ensureClones();
            Array.from(
                track.querySelectorAll('.fresh-lifestyle__slide'),
            ).forEach((s) => {
                s.style.flex = `0 0 ${slideWidth()}%`;
            });
            currentIndex %= slideCount;
            goTo(currentIndex, false);
            startAutoplay();
        };

        carousel.addEventListener('mouseenter', stopAutoplay);
        carousel.addEventListener('mouseleave', () => {
            if (getPerView() < slideCount) startAutoplay();
        });

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
        const slides = Array.from(
            track.querySelectorAll('.fresh-benefits__slide'),
        );
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
            slides.forEach((s) => {
                s.style.flex = `0 0 ${100 / perView}%`;
            });
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

        const pluses = Array.from(
            section.querySelectorAll('.fresh-inside__plus'),
        );
        const cards = Array.from(
            section.querySelectorAll('.fresh-inside__card'),
        );
        if (!pluses.length || !cards.length) return;

        const closeButtons = Array.from(
            section.querySelectorAll('.fresh-inside__card-close'),
        );
        let transitioning = false;

        const showImmediate = (targetId) => {
            cards.forEach((c) => {
                const isTarget = c.dataset.card === targetId;
                c.classList.toggle('is-visible', isTarget);
                c.classList.toggle('is-animating-in', isTarget);
                c.classList.remove('is-animating-out');
            });
            pluses.forEach((p) =>
                p.classList.toggle('is-active', p.dataset.target === targetId),
            );
        };

        const show = (targetId) => {
            if (transitioning) return;
            const current = cards.find((c) =>
                c.classList.contains('is-visible'),
            );

            if (!current || current.dataset.card === targetId) {
                showImmediate(targetId);
                return;
            }

            transitioning = true;
            current.classList.add('is-animating-out');

            current.addEventListener(
                'transitionend',
                () => {
                    current.classList.remove('is-visible', 'is-animating-out');
                    showImmediate(targetId);
                    transitioning = false;
                },
                { once: true },
            );
        };

        const hide = () => {
            if (transitioning) return;
            const current = cards.find((c) =>
                c.classList.contains('is-visible'),
            );
            if (!current) return;

            transitioning = true;
            current.classList.add('is-animating-out');

            current.addEventListener(
                'transitionend',
                () => {
                    current.classList.remove('is-visible', 'is-animating-out');
                    pluses.forEach((p) => p.classList.remove('is-active'));
                    transitioning = false;
                },
                { once: true },
            );
        };

        pluses.forEach((p) => {
            p.addEventListener('click', () => show(p.dataset.target));
        });

        closeButtons.forEach((btn) => {
            btn.addEventListener('click', hide);
        });

        show(pluses[0].dataset.target);
    }

    initFaqAnimation() {
        const items = document.querySelectorAll('.fresh-faq__item');
        if (!items.length) return;

        items.forEach((details) => {
            const summary = details.querySelector('summary');
            if (!summary) return;

            summary.addEventListener('click', (e) => {
                e.preventDefault();
                if (details.open) {
                    details.removeAttribute('open');
                } else {
                    details.setAttribute('open', '');
                }
            });
        });
    }
}
