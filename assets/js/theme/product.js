/*
 Import all product specific js
 */
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import { classifyForm } from './common/utils/form-utils';
import modalFactory from './global/modal';
import PageManager from './page-manager';
import Review from './product/reviews';
import videoGallery from './product/video-gallery';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form')[0];
    }

    onReady() {
        this.fillDescriptionTabs();
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (
                this.url.indexOf('#write_review') !== -1 &&
                typeof window.history.replaceState === 'function'
            ) {
                window.history.replaceState(
                    null,
                    document.title,
                    window.location.pathname,
                );
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails(
            $('.productView'),
            this.context,
            window.BCData.product_attributes,
        );
        this.productDetails.setProductVariant();

        videoGallery();

        this.bulkPricingHandler();

        const $reviewForm = classifyForm('.writeReview-form');

        if ($reviewForm.length === 0) return;

        const review = new Review({ $reviewForm });

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
            this.ariaDescribeReviewInputs($reviewForm);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
    }

    ariaDescribeReviewInputs($form) {
        $form.find('[data-input]').each((_, input) => {
            const $input = $(input);
            const msgSpanId = `${$input.attr('name')}-msg`;

            $input.siblings('span').attr('id', msgSpanId);
            $input.attr('aria-describedby', msgSpanId);
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }

    fillDescriptionTabs() {
        const { productDescription: description } = this.context;
        if (!description) return;

        const fill = (id, content) => {
            const el = document.getElementById(id);
            if (el) el.innerHTML = content;
        };

        if (!description.includes('<!-- pagebreak -->')) {
            fill('tab-description', description);
            fill('tab-mobile-description', description);
            return;
        }

        const [overview, composition, constituents, instructions] = description.trim().split('<!-- pagebreak -->');

        fill('tab-description', overview);
        fill('tab-mobile-description', overview);

        fill('tab-composition', composition);
        fill('tab-instructions', composition);
        fill('tab-supplements-composition', composition);
        fill('tab-mobile-composition', composition);
        fill('tab-mobile-instructions', composition);
        fill('tab-mobile-supplements-composition', composition);

        fill('tab-constituents', constituents);
        fill('tab-health-safety', constituents);
        fill('tab-supplements-constituents', constituents);
        fill('tab-mobile-constituents', constituents);
        fill('tab-mobile-health-safety', constituents);
        fill('tab-mobile-supplements-constituents', constituents);

        fill('tab-supplements-instructions', instructions);
        fill('tab-mobile-supplements-instructions', instructions);
    }
}
