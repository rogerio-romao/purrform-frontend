import 'focus-within-polyfill';

import './global/jquery-migrate';
import './common/select-option-plugin';
import PageManager from './page-manager';
import quickSearch from './global/quick-search';
import currencySelector from './global/currency-selector';
import mobileMenuToggle from './global/mobile-menu-toggle';
import menu from './global/menu';
import foundation from './global/foundation';
import quickView from './global/quick-view';
import cartPreview from './global/cart-preview';
import privacyCookieNotification from './global/cookieNotification';
import carousel from './common/carousel';
import svgInjector from './global/svg-injector';
import calculatorDropdown from './custom/calculatorDropdown';
import descriptionTabs from './custom/descriptionTabs';
import common from './custom/common';

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
       

        $(document).ready(function() {
            function handleImageVisibility() {
              var windowWidth = $(window).width();
              var $contentImage = $('#contentImage');
              
              if (windowWidth >= 768) {
                var desktopSrc = $contentImage.data('desktop-src');
                $contentImage.attr('src', desktopSrc);
              } else {
                var mobileSrc = $contentImage.data('mobile-src');
                $contentImage.attr('src', mobileSrc);
              }
            }
            
            // Initial visibility check
            handleImageVisibility();
            
            // Handle visibility on window resize
            $(window).resize(function() {
              handleImageVisibility();
            });
          });
          common();
// Function to hide all ".quick-add-to-cart" elements except for the specified card
function hideOtherAddToCartElements(currentCard) {
  var allCards = document.querySelectorAll(".card");

  allCards.forEach(function (card) {
      if (card !== currentCard) {
          var addToCartWrapper = card.querySelector(".quick-add-to-cart");

          // Check if addToCartWrapper is not null before accessing its style property
          if (addToCartWrapper) {
              addToCartWrapper.style.display = "none";
          }
      }
  });
}
// Function to hide all ".quick-add-to-cart" elements except for the specified card
function hideOtherAddToCartElements(currentCard) {
  var allCards = document.querySelectorAll(".card");

  allCards.forEach(function (card) {
      if (card !== currentCard) {
          var addToCartWrapper = card.querySelector(".quick-add-to-cart");

          // Check if addToCartWrapper is not null and does not contain the clicked element
          if (addToCartWrapper && !addToCartWrapper.contains(event.target)) {
              addToCartWrapper.style.display = "none";
          }
      }
  });
}

// Get all elements with class "quick-cart"
var quickCartElements = document.querySelectorAll(".quick-cart");

// Loop through each "quick-cart" element
quickCartElements.forEach(function (quickCart) {
  // Add click event listener to each "quick-cart"
  quickCart.addEventListener("click", function (event) {
      // Find the parent ".card" element
      var card = quickCart.closest(".card");

      // Find the ".quick-add-to-cart" within the same card
      var addToCartWrapper = card.querySelector(".quick-add-to-cart");

      // Check if addToCartWrapper is not null before accessing its style property
      if (addToCartWrapper) {
          // Toggle the visibility of ".quick-add-to-cart"
          addToCartWrapper.style.display = addToCartWrapper.style.display === "none" ? "block" : "none";

          // Hide ".quick-add-to-cart" elements of other cards
          hideOtherAddToCartElements(card);
      }

      // Prevent the click event from propagating to the document body
      event.stopPropagation();
  });
});

// Add click event listener to the document body to hide ".quick-add-to-cart" when clicking outside
document.body.addEventListener("click", function (event) {
  var allCards = document.querySelectorAll(".card");

  allCards.forEach(function (card) {
      var addToCartWrapper = card.querySelector(".quick-add-to-cart");

      // Check if addToCartWrapper is not null and does not contain the clicked element
      if (addToCartWrapper && !addToCartWrapper.contains(event.target)) {
          addToCartWrapper.style.display = "none";
      }
  });
});

// Function to handle the click event on add-quantity buttons
function handleAddQuantityButtonClick() {
    // Get all elements with class "add-quantity"
    var addQuantityButtons = document.querySelectorAll(".add-quantity span");

    // Loop through each "add-quantity" button
    addQuantityButtons.forEach(function (button) {
        // Add click event listener to each button
        button.addEventListener("click", function () {
            // Remove the "active" class from all spans
            addQuantityButtons.forEach(function (span) {
                span.classList.remove("active");
            });

            // Add the "active" class to the clicked span
            button.classList.add("active");

            // Find the parent ".card" element
            var card = button.closest(".card");

            // Find the related input with class "form-input--incrementTotal"
            var incrementTotalInput = card.querySelector(".form-input--incrementTotal");

            // Update the value of the input with the HTML content of the span
            incrementTotalInput.value = button.innerHTML;
        });
    });
}

// Function to reload the script
function reloadScriptIfPageChanged() {
    // Reload the script if the page URL contains "?page="
    if (window.location.href.indexOf('?page=') > -1) {
        handleAddQuantityButtonClick();
    }
}

// Call the function on document ready
jQuery(document).ready(function ($) {
    handleAddQuantityButtonClick();

    // Check for page changes using the popstate event
    window.addEventListener('popstate', reloadScriptIfPageChanged);
    
    // Optionally, you can also check for changes on initial load
    reloadScriptIfPageChanged();
});


    }
}
