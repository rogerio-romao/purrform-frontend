/* eslint-disable function-paren-newline */
import 'focus-within-polyfill';

import carousel from './common/carousel';
import './common/select-option-plugin';
import calculatorDropdown from './custom/calculatorDropdown';
import descriptionTabs from './custom/descriptionTabs';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import currencySelector from './global/currency-selector';
import foundation from './global/foundation';
import './global/jquery-migrate';
import menu from './global/menu';
import mobileMenuToggle from './global/mobile-menu-toggle';
import quickSearch from './global/quick-search';
import quickView from './global/quick-view';
import svgInjector from './global/svg-injector';
import PageManager from './page-manager';

export default class Global extends PageManager {
    onReady() {
        const { cartId, secureBaseUrl } = this.context;
        cartPreview(secureBaseUrl, cartId);
        quickSearch();
        currencySelector(cartId);
        foundation($(document));
        quickView(this.context);
        carousel(this.context);
        menu();
        mobileMenuToggle();
        privacyCookieNotification();
        svgInjector();
        descriptionTabs();
        calculatorDropdown();

        $(() => {
            function handleImageVisibility() {
                const windowWidth = $(window).width();
                const $contentImage = $('#contentImage');

                if (windowWidth >= 768) {
                    const desktopSrc = $contentImage.data('desktop-src');
                    $contentImage.attr('src', desktopSrc);
                } else {
                    const mobileSrc = $contentImage.data('mobile-src');
                    $contentImage.attr('src', mobileSrc);
                }
            }

            // Initial visibility check
            handleImageVisibility();

            // Handle visibility on window resize
            $(window).on('resize', () => {
                handleImageVisibility();
            });
        });

        $(document).on('click', '.quick-cart', (event) => {
            event.stopPropagation();
            const addToCartWrapper = $(event.currentTarget)
                .closest('.card')
                .find('.quick-add-to-cart');
            addToCartWrapper.toggle();
        });

        // Add click event listener to the document body to hide ".quick-add-to-cart" when clicking outside
        document.body.addEventListener('click', (event) => {
            const allCards = document.querySelectorAll('.card');

            allCards.forEach((card) => {
                const addToCartWrapper =
                    card.querySelector('.quick-add-to-cart');

                // Check if addToCartWrapper is not null and does not contain the clicked element
                if (
                    addToCartWrapper &&
                    !addToCartWrapper.contains(event.target)
                ) {
                    addToCartWrapper.style.display = 'none';
                }
            });
        });

        $(document).on('click', '.add-quantity span', (event) => {
            event.stopImmediatePropagation();
            // Remove the "active" class from all spans
            $('.add-quantity span').removeClass('active');

            // Add the "active" class to the clicked span
            $(event.currentTarget).addClass('active');

            // Find the parent ".card" element
            const card = $(event.currentTarget).closest('.card');

            // Find the related input with class "form-input--incrementTotal"
            const incrementTotalInput = card.find(
                // eslint-disable-next-line comma-dangle
                '.form-input--incrementTotal'
            );

            // Update the value of the input with the HTML content of the span
            incrementTotalInput.val($(event.currentTarget).html());
        });
    }
}
