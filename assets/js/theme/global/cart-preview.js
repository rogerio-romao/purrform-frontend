import 'foundation-sites/js/foundation/foundation';
import 'foundation-sites/js/foundation/foundation.dropdown';
import utils from '@bigcommerce/stencil-utils';
import { debounce } from 'lodash';
import { showAlertModal } from './modal';

export const CartPreviewEvents = {
    close: 'closed.fndtn.dropdown',
    open: 'opened.fndtn.dropdown',
};

const UPDATE_DEBOUNCE = 400;

export default function (secureBaseUrl, cartId) {
    const loadingClass = 'is-loading';
    const $cart = $('[data-cart-preview]');
    const $cartDropdown = $('#cart-preview-dropdown');
    const $cartLoading = $('<div class="loadingOverlay"></div>');

    const $body = $('body');

    // Target quantity per item id, accumulated optimistically so that rapid
    // clicks resolve to a single request carrying the final absolute quantity
    // rather than a stale oldQty +/- 1.
    const pendingQty = {};
    // One debounced sender per item id. A single shared debounced function
    // would drop the first item's update when two rows are touched inside the
    // debounce window.
    const senders = {};

    function getRow(itemId) {
        return $cartDropdown.find(`.previewCartItem[data-cart-itemid="${itemId}"]`);
    }

    function setRowBusy($row, busy) {
        $row.toggleClass('is-updating', busy);
        $row.find('[data-minicart-update]').prop('disabled', busy);
        $row.find('.minicart-remove').prop('disabled', busy);
    }

    function showRowError($row, message) {
        $row.find('[data-minicart-error]').text(message || '');
    }

    function clearRowError($row) {
        showRowError($row, '');
    }

    /**
     * Re-render the popover from the server so line totals, the subtotal and
     * removed rows all resolve at once, and sync the nav pill. Handlers are
     * delegated, so replacing the markup needs no rebinding.
     *
     * Passing an error re-renders too (discarding the optimistic value, which
     * is how a failed update gets rolled back) and surfaces the message inline
     * on the affected row.
     */
    function refreshPreview(errorItemId, errorMessage) {
        const options = { template: 'common/cart-preview' };

        utils.api.cart.getContent(options, (err, response) => {
            if (err || !response) {
                return;
            }

            $cartDropdown.html(response);

            if (errorItemId !== undefined) {
                showRowError(getRow(errorItemId), errorMessage);
                return;
            }

            // The wrapper carries the authoritative cart quantity, so the nav
            // pill syncs without a second request.
            const quantity =
                $cartDropdown.find('[data-cart-quantity]').data('cartQuantity') || 0;

            $body.trigger('cart-quantity-update', quantity);

            // Keep the full cart page in step when the popover is opened over
            // it. A reload is used deliberately: cart.js bindCartEvents()
            // dereferences #cart-min-quantity-status and .validate-cart with no
            // null guards, so re-rendering in place is not safe from here.
            if ($('[data-cart-content]').length) {
                window.location.reload();
            }
        });
    }

    function sendUpdate(itemId) {
        const $row = getRow(itemId);
        const newQty = pendingQty[itemId];

        if (newQty === undefined) {
            return;
        }

        delete pendingQty[itemId];
        setRowBusy($row, true);

        utils.api.cart.itemUpdate(itemId, newQty, (err, response) => {
            if (err || !response || response.data.status !== 'succeed') {
                setRowBusy($row, false);

                const message =
                    response && response.data && response.data.errors
                        ? response.data.errors.join('\n')
                        : '';

                // Roll the optimistic number back to the server's value.
                refreshPreview(itemId, message);
                return;
            }

            refreshPreview();
        });
    }

    function queueUpdate(itemId) {
        if (!senders[itemId]) {
            senders[itemId] = debounce(() => sendUpdate(itemId), UPDATE_DEBOUNCE);
        }

        senders[itemId]();
    }

    if (window.ApplePaySession) {
        $cartDropdown.addClass('apple-pay-supported');
    }

    $body.on('cart-quantity-update', (event, quantity) => {
        $cart.attr('aria-label', (_, prevValue) => prevValue.replace(/\d+/, quantity));

        if (!quantity) {
            $cart.addClass('navUser-item--cart__hidden-s');
        } else {
            $cart.removeClass('navUser-item--cart__hidden-s');
        }

        $('.cart-quantity')
            .text(quantity)
            .toggleClass('countPill--positive', quantity > 0);
        if (utils.tools.storage.localStorageAvailable()) {
            localStorage.setItem('cart-quantity', quantity);
        }
    });

    $cart.on('click', event => {
        const options = {
            template: 'common/cart-preview',
        };

        // Redirect to full cart page
        //
        // https://developer.mozilla.org/en-US/docs/Browser_detection_using_the_user_agent
        // In summary, we recommend looking for the string 'Mobi' anywhere in the User Agent to detect a mobile device.
        if (/Mobi/i.test(navigator.userAgent)) {
            return event.stopPropagation();
        }

        event.preventDefault();

        $cartDropdown
            .addClass(loadingClass)
            .html($cartLoading);
        $cartLoading
            .show();

        utils.api.cart.getContent(options, (err, response) => {
            $cartDropdown
                .removeClass(loadingClass)
                .html(response);
            $cartLoading
                .hide();
        });
    });

    // Delegated from the dropdown, which is the only stable ancestor: its
    // contents are replaced wholesale on every open and after every mutation.
    $cartDropdown.on('click', '[data-minicart-update]', event => {
        event.preventDefault();

        const $target = $(event.currentTarget);
        const itemId = $target.data('cartItemid');
        const $row = getRow(itemId);
        const $input = $row.find('[data-minicart-qty]');

        const currentQty =
            pendingQty[itemId] !== undefined
                ? pendingQty[itemId]
                : parseInt($input.val(), 10);
        const minQty = parseInt($input.data('quantityMin'), 10) || 1;
        const maxQty = parseInt($input.data('quantityMax'), 10);
        const newQty = $target.data('action') === 'inc' ? currentQty + 1 : currentQty - 1;

        clearRowError($row);

        // Decrement floors at the item's minimum; removal is a separate,
        // explicit action.
        if (newQty < minQty) {
            showRowError($row, $input.data('quantityMinError'));
            return;
        }

        if (maxQty > 0 && newQty > maxQty) {
            showRowError($row, $input.data('quantityMaxError'));
            return;
        }

        // Optimistic: paint the target immediately, reconcile on response.
        $input.val(newQty);
        $row.find('[data-minicart-update][data-action="dec"]').prop('disabled', newQty <= minQty);
        pendingQty[itemId] = newQty;

        queueUpdate(itemId);
    });

    $cartDropdown.on('click', '.minicart-remove', event => {
        event.preventDefault();

        const $target = $(event.currentTarget);
        const itemId = $target.data('cartItemid');

        showAlertModal($target.data('confirmDelete'), {
            icon: 'warning',
            showCancelButton: true,
            onConfirm: () => {
                pendingQty[itemId] = 0;
                sendUpdate(itemId);
            },
        });
    });

    let quantity = 0;

    if (cartId) {
        // Get existing quantity from localStorage if found
        if (utils.tools.storage.localStorageAvailable()) {
            if (localStorage.getItem('cart-quantity')) {
                quantity = Number(localStorage.getItem('cart-quantity'));
                $body.trigger('cart-quantity-update', quantity);
            }
        }

        // Get updated cart quantity from the Cart API
        const cartQtyPromise = new Promise((resolve, reject) => {
            utils.api.cart.getCartQuantity({ baseUrl: secureBaseUrl, cartId }, (err, qty) => {
                if (err) {
                    // If this appears to be a 404 for the cart ID, set cart quantity to 0
                    if (err === 'Not Found') {
                        resolve(0);
                    } else {
                        reject(err);
                    }
                }
                resolve(qty);
            });
        });

        // If the Cart API gives us a different quantity number, update it
        cartQtyPromise.then(qty => {
            quantity = qty;
            $body.trigger('cart-quantity-update', quantity);
        });
    } else {
        $body.trigger('cart-quantity-update', quantity);
    }
}
