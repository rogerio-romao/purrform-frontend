/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/utils/form-utils';
import modalFactory from './global/modal';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
        this.reviewModal = modalFactory('#modal-review-form')[0];
    }

    onReady() {
        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        let validator;

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
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

        $(document).ready(function() {
            var content = $('.product-description').html();            
            
            var sections = content.split('<p><!-- pagebreak --></p>');
            var accordionContainer = $('#accordion-container');
            var compositionContent = '';
            var analyticalContent = '';
            var descriptionContent = '';
          
            $.each(sections, function(index, section) {
              var strongText = $(section).find('strong').first().text();
          
              if (strongText.indexOf('COMPOSITION') !== -1) {
                compositionContent = section.split('<strong>COMPOSITION:</strong>')[1];
              } else if (section.indexOf('ANALYTICAL CONSTITUENTS') !== -1) {
                analyticalContent = section.split('<strong>ANALYTICAL CONSTITUENTS:</strong>')[1];
              } else {
                descriptionContent += '<p>' + $(section).html() + '</p>';
              }
            });
          
            var accordionSection = `
              <ul class="descriptiontabs">
                <li class="active" rel="descriptionContent"><span>Description</span></li>
                <li rel="compositionContent"><span>Composition</span></li>
                <li rel="analyticalContent"><span>Analytical Constituents</span></li> 
              </ul>
          
              <div class="tab_container">
                <div id="descriptionContent" class="tab_content">
                  <h2 class="tab_drawer_heading">Description</h2>
                  ${descriptionContent}
                </div>
            
                <div id="compositionContent" class="tab_content">
                  <h2 class="tab_drawer_heading">COMPOSITION</h2>
                  <p>${compositionContent}</p>
                </div>
            
                <div id="analyticalContent" class="tab_content">
                  <h2 class="tab_drawer_heading">Analytical Constituents</h2>
                  ${analyticalContent}
                </div>
              </div>
            `;
          
            accordionContainer.append(accordionSection);
          
            $('.descriptiontabs li').click(function() {
              var tabId = $(this).attr('rel');
              
              $('.descriptiontabs li').removeClass('active');
              $(this).addClass('active');
              
              $('.tab_content').hide();
              $('#' + tabId).show();
            });
          
            $('.tab_drawer_heading').click(function() {
              var tabId = $(this).attr('rel');
              
              $('.tab_drawer_heading').removeClass('d_active');
              $(this).addClass('d_active');
              
              $('.tab_content').hide();
              $('#' + tabId).show();
            });
          
            // Show default tab
            $('.descriptiontabs li:first').addClass('active');
            $('.tab_content:first').show();
            $('.tab_drawer_heading:first').addClass('d_active');
            
            // Remove original content
            $('.productView-description .product-description').remove();
            $('.productView-description .productView-title').remove();
          });

          // FAQ accordion
          $(document).ready(function() {
            $(".heading").click(function() {
              $(this).next(".contents").slideToggle();
              $(this).toggleClass("active");
            });
          });
          
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
}
