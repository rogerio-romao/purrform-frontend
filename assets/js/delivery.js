// This is a custom function to check if an element is ready in the DOM with MutationObserver (no timers)
(function (win) {
    'use strict';

    var listeners = [],
        doc = win.document,
        MutationObserver = win.MutationObserver || win.WebKitMutationObserver,
        observer;

    function ready(selector, fn) {
        // Store the selector and callback to be monitored
        listeners.push({
            selector: selector,
            fn: fn,
        });
        if (!observer) {
            // Watch for changes in the document
            observer = new MutationObserver(check);
            observer.observe(doc.documentElement, {
                childList: true,
                subtree: true,
            });
        }
        // Check if the element is currently in the DOM
        check();
    }

    function check() {
        // Check the DOM for elements matching a stored selector
        for (
            var i = 0, len = listeners.length, listener, elements;
            i < len;
            i++
        ) {
            listener = listeners[i];
            // Query for elements matching the specified selector
            elements = doc.querySelectorAll(listener.selector);
            for (var j = 0, jLen = elements.length, element; j < jLen; j++) {
                element = elements[j];
                // Make sure the callback isn't invoked with the
                // same element more than once
                if (!element.ready) {
                    element.ready = true;
                    // Invoke the callback with the element
                    listener.fn.call(element, element);
                }
            }
        }
    }

    // Expose `ready`
    win.ready = ready;
})(this);

// ------------------------------------------------------//
// change the text on the mobile modal
const mobileModalSelector = '.cartDrawer.optimizedCheckout-orderSummary';
ready(mobileModalSelector, (mobileModalElement) => {
    mobileModalElement.querySelector('.cartDrawer-body a').textContent =
        'Show Details & Rewards';
});

// ------------------------------------------------------//
// This  handles 'datepicker' in 'shipping'
const shippingSelector = '#checkout-shipping-options';
ready(shippingSelector, (shippingOptionsElement) => {
    createCalendar(shippingOptionsElement);
});

// Attach the datepicker to the shipping options
function createCalendar(parent) {
    const existingInstructions = document.getElementById('datepicker-hoster');
    if (existingInstructions) {
        return;
    }

    // Define the HTML code for the elements
    const datePickerHTML = `
        <div id="datepicker-hoster" class="datepicker">
            <div class="cart-total-label">
                <strong style="color: #687d6a;">Delivery Date *</strong>
            </div>
            <div class="voucher-section">
                <input type="text" id="datepicker" name="datepicker" readonly autocomplete="off" aria-autocomplete="none" class="form-input" style="background: white; width: calc(100%); border-radius: 45px; border-color: #687d6a; color: #687d6a; font-size: 16px; text-align: center;" onkeydown="return false;">
                <p id="datepicker_err" style="display: none; color: red; font-size: 16px; font-weight: normal;"></p>
            </div>
            <p style="font-size: 16px;">*Next Day delivery is usually available on any orders placed before 12 noon, Monday to Friday. Excluding some postcodes in Scotland.</p>
        </div>
    `;
    parent.insertAdjacentHTML('beforeend', datePickerHTML);
    getCalendarData();
}

// Get data for the calendar
function getCalendarData() {
    // Create calendar and attach date picker logic here
    let dailyDeliveryLimit = 250;
    const dailySlotValues = {};
    const disabledDates = [];

    // get delivery dates from middleware
    fetch('https://purrform-apps-027e.onrender.com/deliveryDates')
        .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then((data) => {
            disabledDates.push(...data.unavailableDates);
            for (const [date, slots] of Object.entries(data.dateSlots)) {
                dailySlotValues[date] = slots;
            }
            if (data.perDay) {
                dailyDeliveryLimit = data.perDay;
            }
            attachDatePicker(
                dailyDeliveryLimit,
                dailySlotValues,
                disabledDates
            );
        })
        .catch((error) => {
            console.log(
                'Error calling delivery dates middleware endpoint:',
                error
            );
            // Handle error if necessary
        });
}

// Attach the calendar to the datepicker and enable/disable dates
function attachDatePicker(dailyDeliveryLimit, dailySlotValues, disabledDates) {
    function disableDates(day) {
        // day gets implicitly passed by jQuery Calendar
        const selectedShippingMethod = document.querySelector(
            '.form-checklist-item--selected'
        );

        const isSaturdayDelivery = selectedShippingMethod
            .querySelector('.shippingOption-desc')
            .textContent.toLowerCase()
            .includes('saturday');

        return isSaturdayDelivery ? enableSaturday(day) : enableWeekdays(day);
    }

    // Disable everything except Saturdays
    function enableSaturday(day) {
        const dayBeingCheckedFormatted = $.datepicker.formatDate(
            'yy-mm-dd',
            day
        );

        const dayOfTheWeek = day.getDay();
        const saturdayDay = 6;

        if (dayOfTheWeek !== saturdayDay) {
            return [false, '', '']; // disabled boolean, css class, tooltip
        }

        let slotsForThisDay =
            dailySlotValues[dayBeingCheckedFormatted] ?? dailyDeliveryLimit;
        if (slotsForThisDay > dailyDeliveryLimit) {
            // this should never happen, but just in case
            slotsForThisDay = dailyDeliveryLimit;
        }

        // Enable check
        const isSaturdayEnabled =
            slotsForThisDay > 0 &&
            !disabledDates.includes(dayBeingCheckedFormatted);

        return [isSaturdayEnabled, '', `Slots available: ${slotsForThisDay}`]; // enabled boolean, css class, tooltip
    }

    // Enable weekdays
    function enableWeekdays(day) {
        const dayBeingCheckedFormatted = $.datepicker.formatDate(
            'yy-mm-dd',
            day
        );

        const dayOfTheWeek = day.getDay();
        // Disable if 6 (Saturday) 0 (Sunday) or 1 (Monday)
        if (dayOfTheWeek === 6 || dayOfTheWeek === 0 || dayOfTheWeek === 1) {
            return [false, '', '']; // disabled boolean, css class, tooltip
        }

        let slotsForThisDay =
            dailySlotValues[dayBeingCheckedFormatted] ?? dailyDeliveryLimit;
        if (slotsForThisDay > dailyDeliveryLimit) {
            // this should never happen, but just in case
            slotsForThisDay = dailyDeliveryLimit;
        }

        const isEnabledDay =
            slotsForThisDay > 0 &&
            !disabledDates.includes(dayBeingCheckedFormatted);

        return [isEnabledDay, '', `Slots available: ${slotsForThisDay}`]; // enabled boolean, css class, tooltip
    }

    $('#datepicker').datepicker({
        beforeShowDay: disableDates,
        onClose: function () {
            const datepicker = document.querySelector('#datepicker');
            const deliveryDate = datepicker.value;
            if (deliveryDate) {
                sessionStorage.setItem('deliveryDate', deliveryDate);
            }
        },
        defaultDate: '+1D',
        minDate: '+1D',
        maxDate: '+21D',
        dateFormat: 'd MM, yy',
        showOtherMonths: true,
        firstDay: 1,
        placeholder: 'Select Date',
    });

    $('#datepicker').attr('placeholder', 'Select Date');
}

// ------------------------------------------------------//
// handle proceed button
const proceedButtonSelector = '#proceedButton';
ready(proceedButtonSelector, (proceedButton) => {
    proceedButton.addEventListener('click', function (e) {
        e.preventDefault();
        const deliveryDate = sessionStorage.getItem('deliveryDate');
        const customerMessage = sessionStorage.getItem('customerMessage');
        const realContinueButton = document.querySelector(
            '#checkout-shipping-continue'
        );

        const datepickerErrorElement =
            document.getElementById('datepicker_err');

        if (!deliveryDate) {
            datepickerErrorElement.textContent =
                'Please select a delivery date before proceeding.';
            datepickerErrorElement.style.display = 'block';
            return;
        }
        // Proceed with the form submission
        datepickerErrorElement.style.display = 'none';

        const selectElement = document.querySelector('#delivery_inst_tag');
        const selectedValue = selectElement.value;
        const deliveryInstructions =
            selectedValue === 'user_instruction' && customerMessage.length > 0
                ? customerMessage
                : 'Will be in';

        const fullInstructions = `${deliveryDate} | ${deliveryInstructions}`;

        // Update the customer message with the delivery instructions
        const checkoutId = jsContext.checkoutId;
        fetch(`/api/storefront/checkouts/${checkoutId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                customerMessage: fullInstructions,
            }),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('PUT request failed');
                }
                return response.json(); // Parse the JSON response
            })
            .then((data) => {
                sessionStorage.removeItem('deliveryDate');
                sessionStorage.removeItem('customerMessage');
                realContinueButton.click();
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    });
});

// ------------------------------------------------------//
// This handles the delivery details / customer message
const deliveryDetailsSelector =
    'fieldset.form-fieldset[data-test="checkout-shipping-comments"]';
ready(deliveryDetailsSelector, (deliveryDetailsElement) => {
    const existingInstructions = document.getElementById('instruction-wrap');
    if (existingInstructions) {
        return;
    }

    // generate custom HTML
    const instructionsDiv = `
        <div id="instruction-wrap" class="delivery_instruction_wrapper">
            <div class="del_cont">
                <label class="form-legend optimizedCheckout-headingSecondary">Delivery Details</label>
                <select class="form-select form-select--small" id="delivery_inst_tag">
                    <option value="Will be in">Will be in</option>
                    <option value="user_instruction">User instruction</option>
                </select>
                <textarea style="display:none" name="delivery_user_text" id="delivery_user_text" rows="3" cols="40" class="form-input"></textarea>
            </div>
            <div id="proceedButton">Continue</div>
        </div>
        `;

    deliveryDetailsElement.insertAdjacentHTML('afterend', instructionsDiv);

    const selectElement = document.getElementById('delivery_inst_tag');
    const textarea = document.getElementById('delivery_user_text');

    selectElement.addEventListener('change', function () {
        const selectedValue = selectElement.value;
        if (selectedValue === 'user_instruction') {
            textarea.style.display = 'block';
            textarea.style.margin = '10px 0';
            textarea.focus();
        } else {
            textarea.style.display = 'none';
        }
    });

    textarea.addEventListener('input', function () {
        const deliveryInstructions = textarea.value;
        sessionStorage.setItem('customerMessage', deliveryInstructions);
    });
});

// ------------------------------------------------------//
// This handles the payment continue button
const paymentContinueButtonSelector = '#checkout-payment-continue';
ready(paymentContinueButtonSelector, (paymentContinueButton) => {
    const fakeButton = document.createElement('div');
    const missingWarn = document.createElement('p');
    const parent = document.querySelector(
        '.checkout-step--payment .checkout-form .form-actions'
    );

    // hide the real button
    paymentContinueButton.style.display = 'none';

    // Generate placeholder button
    fakeButton.innerHTML = 'Place Order';
    fakeButton.id = 'fakeButton';
    fakeButton.style.display = 'block';

    // Generate warning text
    missingWarn.classList.add('warning');
    missingWarn.textContent =
        "Cannot find delivery date. Please review your 'shipping' details.";
    missingWarn.style.display = 'none';

    // Append the button to the body of the HTML document
    parent.appendChild(missingWarn);
    parent.appendChild(fakeButton);

    fakeButton.addEventListener('click', () => {
        const checkoutId = jsContext.checkoutId;
        fetch(`/api/storefront/checkouts/${checkoutId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error('GET request failed');
                }
                return response.json(); // Parse the JSON response
            })
            .then((data) => {
                const deliveryInstructions = data.customerMessage;

                if (deliveryInstructions?.trim()) {
                    paymentContinueButton.click();
                } else {
                    missingWarn.style.display = 'block';
                }
            })
            .catch((error) => {
                console.error('Error:', error);
                missingWarn.textContent =
                    'Something went wrong. Check if you have set a delivery date in shipping and try again.';
                missingWarn.style.display = 'block';
            });
    });
});
