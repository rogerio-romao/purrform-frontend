import PageManager from '../page-manager';

// ── Constants ────────────────────────────────────────────────────────

const KCAL_PER_KG = 1500;

const CALCULATOR_API = 'https://purrform-apps-027e.onrender.com/calculator';

const AGE_CONFIG = {
    1: {
        label: '4-8 Weeks',
        coef: 2.3,
        meals: 'Feed as & when required',
        activity: 95,
        flow: 'kitten',
        productKey: 'weaning',
    },
    2: {
        label: '2-4 Months',
        coef: 2.15,
        meals: 'Divided into 4 to 6 meals a day',
        activity: null,
        flow: 'adolescent',
        productKey: 'kitten',
    },
    3: {
        label: '4-9 Months',
        coef: 1.85,
        meals: 'Divided into 3 to 4 meals a day',
        activity: null,
        flow: 'adult',
        productKey: 'kitten',
    },
    4: {
        label: '9-12 Months',
        coef: 1.5,
        meals: 'Divided into 2 meals a day',
        activity: null,
        flow: 'adult',
        productKey: 'adult',
    },
    5: {
        label: '12+ Months',
        coef: 1.0,
        meals: 'Divided into 2 meals a day',
        activity: null,
        flow: 'adult',
        productKey: 'adult',
    },
};

// activity_value constants from original code
const ACTIVITY_VALUES = {
    neutered: { low: 52, moderate: 64, active: 75 },
    intact: { low: 80, moderate: 87.5, active: 95 },
};

const CAT_IMAGES = {
    ages: [
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/cat1.png',
            modifier: 'kitten',
        },
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/cat2.png',
            modifier: 'young',
        },
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/cat3.png',
            modifier: 'adolescent',
        },
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/original/image-manager/9-12-months-cat-03.png?t=1660570333&_gl=1*1lk0d6z*_ga*ODg5ODM2MTQ0LjE2NTYzMTgwNTQ.*_ga_WS2VZYPC6G*MTY2MDU2NzY4Ny4xMDQuMS4xNjYwNTcwMzQwLjMy',
            modifier: 'preAdult',
        },
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/cat5.png',
            modifier: 'adult',
        },
    ],
    weight: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/cat-weight.png',
    neutered:
        'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/kittengreen-new.png',
    activity:
        'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/twocatsgreen.png',
};

// ── Helpers ──────────────────────────────────────────────────────────

function el(tag, attrs = {}, ...children) {
    const element = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'dataset') {
            for (const [dk, dv] of Object.entries(value)) {
                element.dataset[dk] = dv;
            }
        } else if (key.startsWith('on') && typeof value === 'function') {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else {
            element.setAttribute(key, value);
        }
    }
    for (const child of children) {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child) {
            element.appendChild(child);
        }
    }
    return element;
}

function calculateRDA(weight, activity, coef) {
    const total = Math.round(
        ((weight ** 0.67 * activity * 1000) / KCAL_PER_KG) * coef,
    );
    const kcal = Math.round((150 * total) / 100);
    return { total, kcal };
}

function calculateProductGrams(weight, activity, coef, caloriePerKg) {
    return Math.round(
        ((weight ** 0.67 * activity * 1000) / (caloriePerKg * 10)) * coef,
    );
}

// ── RawsomeCatculator Class ──────────────────────────────────────────

export default class RawsomeCatculator extends PageManager {
    constructor(context) {
        super(context);

        this.state = {
            age: null,
            flow: null,
            weight: null,
            coef: null,
            activity: null,
            neutered: null,
            meals: null,
            total: null,
            kcal: null,
            products: { tubs: [], pouches: [] },
            productsLoaded: false,
        };

        this.container = null;
        this._productsPromise = null;
    }

    onReady() {
        this.container = document.getElementById('catculator');
        if (!this.container) return;
        this.renderAgeStep();
    }

    // ── State ────────────────────────────────────────────────────────

    resetState() {
        this.state = {
            age: null,
            flow: null,
            weight: null,
            coef: null,
            activity: null,
            neutered: null,
            meals: null,
            total: null,
            kcal: null,
            products: { tubs: [], pouches: [] },
            productsLoaded: false,
        };
        this._productsPromise = null;
        this.renderAgeStep();
    }

    // ── API ──────────────────────────────────────────────────────────

    fetchProducts(ageNum) {
        const cfg = AGE_CONFIG[ageNum];
        this._productsPromise = fetch(`${CALCULATOR_API}?age=${ageNum}`)
            .then((res) => res.json())
            .then((data) => {
                this.state.products = {
                    tubs: data[`${cfg.productKey}_tubs`] ?? [],
                    pouches: data[`${cfg.productKey}_pouches`] ?? [],
                };
                this.state.productsLoaded = true;
            })
            .catch(() => {
                this.state.productsLoaded = true;
            });
        return this._productsPromise;
    }

    // ── DOM helpers ──────────────────────────────────────────────────

    clearContainer() {
        while (this.container.firstChild) {
            this.container.removeChild(this.container.firstChild);
        }
    }

    renderStep(headingText, content) {
        this.clearContainer();
        const heading = el(
            'p',
            { className: 'catculator-step__heading' },
            headingText,
        );
        this.container.appendChild(heading);
        if (content) this.container.appendChild(content);
    }

    // ── Steps ────────────────────────────────────────────────────────

    renderAgeStep() {
        const ages = [1, 2, 3, 4, 5];
        const row = el('div', { className: 'catculator-row' });

        ages.forEach((num) => {
            const cfg = AGE_CONFIG[num];
            const img = CAT_IMAGES.ages[num - 1];
            const col = el(
                'div',
                { className: 'catculator-col' },
                el('img', {
                    src: img.src,
                    className: `catculator-col__img catculator-col__img--${img.modifier}`,
                }),
                el(
                    'button',
                    {
                        className: 'rawsome-button--primary',
                        onClick: () => this.selectAge(num),
                    },
                    el('p', {}, cfg.label),
                ),
            );
            row.appendChild(col);
        });

        this.renderStep('How old is your cat?', row);
    }

    selectAge(num) {
        const cfg = AGE_CONFIG[num];
        this.state.age = num;
        this.state.flow = cfg.flow;
        this.state.coef = cfg.coef;
        this.state.meals = cfg.meals;
        this.state.productsLoaded = false;
        this.fetchProducts(num);

        if (cfg.flow === 'kitten') {
            this.state.activity = cfg.activity;
            this.renderKittenWeightStep();
        } else if (cfg.flow === 'adolescent') {
            this.renderAdolescentWeightStep();
        } else {
            this.renderAdultWeightStep();
        }
    }

    renderKittenWeightStep() {
        const content = this._buildWeightLayout(
            () => {
                const w = this._readWeightInput();
                if (!w) return;
                this.state.weight = w;
                this.catculate();
            },
            () => this.renderAgeStep(),
        );
        this.renderStep('How much does your cat weigh?', content);
    }

    renderAdolescentWeightStep() {
        const content = this._buildWeightLayout(
            () => {
                const w = this._readWeightInput();
                if (!w) return;
                this.state.weight = w;
                this.renderAdolescentNeuteredStep();
            },
            () => this.renderAgeStep(),
        );
        this.renderStep('How much does your cat weigh?', content);
    }

    renderAdultWeightStep() {
        const content = this._buildWeightLayout(
            () => {
                const w = this._readWeightInput();
                if (!w) return;
                this.state.weight = w;
                this.renderAdultNeuteredStep();
            },
            () => this.renderAgeStep(),
        );
        this.renderStep('How much does your cat weigh?', content);
    }

    _readWeightInput() {
        const input = this.container.querySelector('#weight_input');
        if (!input) return null;
        const v = parseFloat(input.value);
        return Number.isNaN(v) || v <= 0 ? null : v;
    }

    _buildWeightLayout(onNext, onBack) {
        const input = el('input', {
            id: 'weight_input',
            type: 'number',
            min: '0.1',
            step: '0.1',
        });

        const nextBtn = el(
            'button',
            {
                className: 'rawsome-button--primary',
                disabled: 'disabled',
                onClick: onNext,
            },
            'Next',
        );

        input.addEventListener('input', () => {
            const v = parseFloat(input.value);
            if (Number.isNaN(v) || v <= 0) {
                nextBtn.setAttribute('disabled', 'disabled');
            } else {
                nextBtn.removeAttribute('disabled');
            }
        });

        const backBtn = el(
            'button',
            { className: 'rawsome-button--secondary', onClick: onBack },
            'Back',
        );

        const buttons = el(
            'div',
            { className: 'cat_weight_buttons' },
            backBtn,
            nextBtn,
        );
        const label = el('p', { className: 'cat_weight_p' }, 'kg');
        const inputGroup = el(
            'div',
            { className: 'cat_weight_input_group' },
            label,
            input,
            buttons,
        );
        const img = el('img', {
            src: CAT_IMAGES.weight,
            className: 'cat_weight_img',
        });
        return el('div', { className: 'cat_weight_cal' }, img, inputGroup);
    }

    renderAdolescentNeuteredStep() {
        const img = el('img', { src: CAT_IMAGES.neutered });

        const yesBtn = el(
            'button',
            {
                className: 'rawsome-button--primary',
                onClick: () => {
                    this.state.neutered = true;
                    this.state.activity = ACTIVITY_VALUES.intact.moderate;
                    this.catculate();
                },
            },
            'Yes',
        );

        const noBtn = el(
            'button',
            {
                className: 'rawsome-button--primary',
                onClick: () => {
                    this.state.neutered = false;
                    this.state.activity = ACTIVITY_VALUES.intact.active;
                    this.catculate();
                },
            },
            'No',
        );

        const backBtn = el(
            'button',
            {
                className: 'rawsome-button--secondary',
                onClick: () => this.renderAdolescentWeightStep(),
            },
            'Back',
        );

        const btnGroup = el(
            'div',
            { className: 'cat_button_group' },
            yesBtn,
            noBtn,
        );

        const layout = el(
            'div',
            { className: 'cat_neutered' },
            img,
            btnGroup,
            backBtn,
        );
        this.renderStep('Is your cat spayed / neutered?', layout);
    }

    renderAdultNeuteredStep() {
        const img = el('img', { src: CAT_IMAGES.neutered });

        const yesBtn = el(
            'button',
            {
                className: 'rawsome-button--primary',
                onClick: () => {
                    this.state.neutered = true;
                    this.renderAdultActivityStep();
                },
            },
            'Yes',
        );

        const noBtn = el(
            'button',
            {
                className: 'rawsome-button--primary',
                onClick: () => {
                    this.state.neutered = false;
                    this.renderAdultActivityStep();
                },
            },
            'No',
        );

        const backBtn = el(
            'button',
            {
                className: 'rawsome-button--secondary',
                onClick: () => this.renderAdultWeightStep(),
            },
            'Back',
        );

        const btnGroup = el(
            'div',
            { className: 'cat_button_group' },
            yesBtn,
            noBtn,
        );

        const layout = el(
            'div',
            { className: 'cat_spayed' },
            img,
            btnGroup,
            backBtn,
        );
        this.renderStep('Is your cat spayed / neutered?', layout);
    }

    renderAdultActivityStep() {
        const isNeutered = this.state.neutered;
        const av = isNeutered
            ? ACTIVITY_VALUES.neutered
            : ACTIVITY_VALUES.intact;

        const makeBtn = (label, actVal) =>
            el(
                'button',
                {
                    className: 'rawsome-button--primary',
                    onClick: () => {
                        this.state.activity = actVal;
                        this.catculate();
                    },
                },
                label,
            );

        const img = el('img', { src: CAT_IMAGES.activity });

        const btnGroup = el(
            'div',
            { className: 'cat_button_group' },
            makeBtn('Not Much', av.low),
            makeBtn('Moderately', av.moderate),
            makeBtn('Active', av.active),
        );

        const backBtn = el(
            'button',
            {
                className: 'rawsome-button--secondary',
                onClick: () => this.renderAdultNeuteredStep(),
            },
            'Back',
        );

        const layout = el(
            'div',
            { className: 'cat_active' },
            img,
            btnGroup,
            backBtn,
        );
        this.renderStep('How active is your cat?', layout);
    }

    catculate() {
        const { weight, activity, coef } = this.state;
        const { total, kcal } = calculateRDA(weight, activity, coef);
        this.state.total = total;
        this.state.kcal = kcal;
        this.renderResultStep();
    }

    renderResultStep() {
        const { total, kcal, meals } = this.state;

        // RDA rows
        const servingRow = el(
            'div',
            { className: 'rc_reccoms' },
            el(
                'p',
                {},
                'Serving per day: ',
                el('span', {}, el('strong', {}, `${total}g`)),
            ),
        );

        const mealsRow = el(
            'div',
            { className: 'daily_meals' },
            el('p', {}, meals),
        );

        const calorieRow = el(
            'div',
            { className: 'rc_reccoms' },
            el(
                'p',
                {},
                'Daily calorie intake: ',
                el('span', {}, el('strong', {}, `${kcal} kcal`)),
            ),
        );

        const startOverBtn = el(
            'button',
            {
                className: 'rawsome-button--secondary',
                onClick: () => this.resetState(),
            },
            'Start Over',
        );

        const inner = el(
            'div',
            { className: 'recom_daily_amount_inner' },
            servingRow,
            mealsRow,
            calorieRow,
            startOverBtn,
        );

        // "View RDA on products" CTA with loading state
        const ctaBtn = el(
            'button',
            {
                id: 'show_product_cta',
                className:
                    'rda_account_btn rawsome-button--secondary cta--loading',
                title: 'loading... please wait',
                onClick: () => this.openProductsModal(),
            },
            'View your RDA on our products ',
            el('span', { className: 'button--loading' }),
        );

        const ctaContainer = el(
            'div',
            { className: 'rda_account_btn_container' },
            ctaBtn,
        );

        // Modal container (hidden until CTA clicked)
        const modalContainer = el('div', {
            id: 'show_RDA',
            className: 'swal2-container swal2-center swal2-backdrop-show',
            hidden: 'hidden',
        });

        const outer = el(
            'div',
            { className: 'recom_daily_amount' },
            inner,
            ctaContainer,
            modalContainer,
        );

        // Heading is rendered separately via renderStep wrapper, but recom_daily_amount_heading
        // needs to be full-width, so we replicate that structure inline here:
        this.clearContainer();

        const heading = el(
            'p',
            { className: 'recom_daily_amount_heading' },
            'Your Recommended Daily Amount (RDA) is...',
        );

        this.container.appendChild(heading);
        this.container.appendChild(outer);

        // Clear loading state once products are available
        if (this._productsPromise) {
            this._productsPromise.then(() => {
                const btn = this.container.querySelector('#show_product_cta');
                if (btn) {
                    btn.classList.remove('cta--loading');
                    btn.removeAttribute('title');
                    const spinner = btn.querySelector('.button--loading');
                    if (spinner) spinner.style.display = 'none';
                }
            });
        } else {
            // No products promise — enable immediately (fallback)
            ctaBtn.classList.remove('cta--loading');
            ctaBtn.removeAttribute('title');
        }
    }

    openProductsModal() {
        const modal = this.container.querySelector('#show_RDA');
        if (!modal) return;

        modal.removeAttribute('hidden');
        modal.innerHTML = '';

        const { tubs, pouches } = this.state.products;
        const { weight, activity, coef } = this.state;

        const buildGrid = (products) => {
            if (!products || products.length === 0) {
                return el(
                    'div',
                    { className: 'wrapper' },
                    el('p', {}, 'No product found'),
                );
            }

            const grid = el('div', { className: 'product-grid' });
            products.forEach((product) => {
                const grams = calculateProductGrams(
                    weight,
                    activity,
                    coef,
                    product.calorie,
                );
                const card = el(
                    'div',
                    { className: 'wrapper' },
                    el(
                        'div',
                        { className: 'image_wrap' },
                        el(
                            'a',
                            { href: product.action_url },
                            el('img', { src: product.image }),
                        ),
                    ),
                    el(
                        'div',
                        { className: 'content_wrap' },
                        el(
                            'a',
                            { href: product.action_url },
                            el(
                                'p',
                                { className: 'product-name' },
                                product.name,
                            ),
                        ),
                    ),
                    el(
                        'div',
                        { className: 'rda_wrap' },
                        el(
                            'p',
                            { className: 'rda_label' },
                            `RDA: ${grams}g per day`,
                        ),
                    ),
                    el(
                        'div',
                        { className: 'cta_wrap' },
                        el(
                            'a',
                            { href: product.action_url },
                            el(
                                'button',
                                { className: 'rawsome-button--primary' },
                                'View Product',
                            ),
                        ),
                    ),
                );
                grid.appendChild(card);
            });
            return grid;
        };

        const tubsSection = el(
            'div',
            {
                id: 'swal2-content_tubs',
                className: 'swal2-html-container tubs',
            },
            buildGrid(tubs),
        );

        const pouchesSection = el(
            'div',
            {
                id: 'swal2-content-pouches',
                className: 'swal2-html-container tubs',
            },
            buildGrid(pouches),
        );

        const content = el(
            'div',
            { className: 'modal-content swal2-content' },
            el('h1', { className: 'product-section__title' }, '450g Tubs'),
            tubsSection,
            el('hr', {}),
            el('h1', { className: 'product-section__title' }, 'Pouches'),
            pouchesSection,
            el('hr', {}),
        );

        const dialog = el('div', { className: 'modal-dialog' }, content);
        modal.appendChild(dialog);
    }

    closeProductsModal() {
        const modal = this.container.querySelector('#show_RDA');
        if (modal) {
            modal.setAttribute('hidden', 'hidden');
            modal.innerHTML = '';
        }
    }
}
