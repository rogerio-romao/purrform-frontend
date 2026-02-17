/* eslint-disable function-paren-newline */
import PageManager from '../page-manager';

// ── Constants ────────────────────────────────────────────────────────
const API_BASE = 'https://purrform-apps-027e.onrender.com';
const KCAL_PER_KG = 1500;
const API_TIMEOUT_MS = 20000;

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

const ACTIVITY_VALUES = {
    neutered: { low: 52, moderate: 64, active: 75 },
    intact: { low: 80, moderate: 87.5, active: 95 },
};

const CAT_IMAGES = {
    ages: [
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/cat1.png',
            class: 'diet-builder-col__img--kitten',
        },
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/cat2.png',
            class: 'diet-builder-col__img--young',
        },
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/cat3.png',
            class: 'diet-builder-col__img--adolescent',
        },
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/original/image-manager/9-12-months-cat-03.png',
            class: 'diet-builder-col__img--preAdult',
        },
        {
            src: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/cat5.png',
            class: 'diet-builder-col__img--adult',
        },
    ],
    weight: 'https://cdn11.bigcommerce.com/s-lh9wfk05w0/images/stencil/320w/image-manager/cat-weight.png',
    neutered:
        'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/kittengreen-new.png',
    activity:
        'https://cdn11.bigcommerce.com/s-lh9wfk05w0/product_images/uploaded_images/twocatsgreen.png',
};

const HEALTH_CONDITIONS = [
    'Diabetes',
    'Chin Acne',
    'Inflammatory Bowel Disease (IBD)',
    'Stage 1 CKD',
    'Urinary Tract Conditions',
    'Dental disease',
    'Hyperthyroidism',
    'Obesity',
];

// ── Helpers ──────────────────────────────────────────────────────────

/**
 * Create an element with optional attributes & children.
 */
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
    const kcalPer1000g = caloriePerKg * 10;
    return Math.round(
        ((weight ** 0.67 * activity * 1000) / kcalPer1000g) * coef,
    );
}

// ── DietBuilder Class ────────────────────────────────────────────────

export default class DietBuilder extends PageManager {
    constructor(context) {
        super(context);

        // Wizard state
        this.state = {
            age: null,
            weight: null,
            coef: null,
            activity: null,
            neutered: null,
            meals: null,
            total: null,
            kcal: null,
            unwantedIngredients: [],
            healthConditions: [],
        };

        // Product data (fetched from API)
        this.products = { tubs: null, pouches: null };
        this.productPromise = null;

        // All products cache (fetched via GraphQL)
        this.allProducts = [];

        // Unique ingredient names across all products
        this.allIngredients = new Set();

        // DOM root
        this.container = null;

        // Fire GraphQL fetch early (before DOM ready)
        this.allProductsPromise = this.fetchAllProducts();
    }

    async onReady() {
        this.container = document.getElementById('diet-builder');
        if (!this.container) return;

        // Resolve the GraphQL product fetch
        try {
            this.allProducts = await this.allProductsPromise;
        } catch (err) {
            this.allProducts = [];
        }

        // Collect unique ingredient names from all products
        this.allIngredients = new Set();
        this.allProducts.forEach((product) => {
            const ingredients = product.customFields?.Ingredients;
            if (ingredients) {
                ingredients.forEach((value) => this.allIngredients.add(value));
            }
        });

        this.renderAgeStep();
    }

    // ── State Management ─────────────────────────────────────────────

    resetState() {
        this.state = {
            age: null,
            weight: null,
            coef: null,
            activity: null,
            neutered: null,
            meals: null,
            total: null,
            kcal: null,
            unwantedIngredients: [],
            healthConditions: [],
        };
        this.products = { tubs: null, pouches: null };
        this.productPromise = null;
        this.allIngredients = new Set();
    }

    // ── API ──────────────────────────────────────────────────────────

    async fetchAllProducts() {
        const token = this.context.storefrontAPIToken;
        if (!token) {
            return [];
        }

        const allProducts = [];
        let hasNextPage = true;
        let cursor = null;

        while (hasNextPage) {
            const afterClause = cursor ? `, after: "${cursor}"` : '';
            const query = `{
                site {
                    products(first: 50${afterClause}) {
                        edges {
                            node {
                                entityId
                                name
                                path
                                defaultImage {
                                    urlOriginal
                                }
                                customFields {
                                    edges {
                                        node {
                                            name
                                            value
                                        }
                                    }
                                }
                            }
                        }
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                    }
                }
            }`;

            try {
                // eslint-disable-next-line no-await-in-loop
                const response = await fetch('/graphql', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ query }),
                });

                if (!response.ok) {
                    throw new Error(
                        `GraphQL responded with ${response.status}`,
                    );
                }

                // eslint-disable-next-line no-await-in-loop
                const { data } = await response.json();
                const { edges, pageInfo } = data.site.products;

                edges.forEach(({ node }) => {
                    const customFields = {};
                    node.customFields.edges.forEach(({ node: cf }) => {
                        if (cf.name === 'Ingredient') {
                            if (!customFields.Ingredients) {
                                customFields.Ingredients = [];
                            }
                            customFields.Ingredients.push(cf.value);
                        } else {
                            customFields[cf.name] = cf.value;
                        }
                    });

                    // Only include food products (those with Ingredients)
                    if (!customFields.Ingredients) return;

                    allProducts.push({
                        entityId: node.entityId,
                        name: node.name,
                        path: node.path,
                        image: node.defaultImage?.urlOriginal || '',
                        customFields,
                    });
                });

                console.log(JSON.stringify(allProducts));

                hasNextPage = pageInfo.hasNextPage;
                cursor = pageInfo.endCursor;
            } catch (err) {
                hasNextPage = false;
            }
        }

        return allProducts;
    }

    async fetchProducts(ageNum) {
        const config = AGE_CONFIG[ageNum];
        const url = `${API_BASE}/calculator?age=${ageNum}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API responded with ${response.status}`);
            }

            const data = await response.json();
            const key = config.productKey;

            this.products.tubs = data[`${key}_tubs`] || null;
            this.products.pouches = data[`${key}_pouches`] || null;
        } catch (_error) {
            // Silently fail — products section will show "No product found"
            this.products.tubs = null;
            this.products.pouches = null;
        }
    }

    // ── Step Rendering ───────────────────────────────────────────────

    clearContainer() {
        this.container.innerHTML = '';
    }

    renderStep(heading, content) {
        this.clearContainer();
        const wrapper = el('div', { className: 'diet-builder-step' });

        if (heading) {
            const headingEl = el(
                'p',
                { className: 'diet-builder-step__heading' },
                heading,
            );
            wrapper.appendChild(headingEl);
        }

        wrapper.appendChild(content);
        this.container.appendChild(wrapper);
    }

    // ── Step 1: Age ──────────────────────────────────────────────────

    renderAgeStep() {
        const row = el('div', { className: 'diet-builder-row' });

        Object.entries(AGE_CONFIG).forEach(([num, config], index) => {
            const imgData = CAT_IMAGES.ages[index];
            const col = el(
                'div',
                { className: 'diet-builder-col' },
                el('img', {
                    src: imgData.src,
                    className: imgData.class,
                    alt: `Cat ${config.label}`,
                }),
                el(
                    'button',
                    {
                        className: 'diet-builder-btn--primary',
                        onClick: () => this.selectAge(Number(num)),
                    },
                    config.label,
                ),
            );
            row.appendChild(col);
        });

        this.renderStep('How old is your cat?', row);
    }

    selectAge(num) {
        const config = AGE_CONFIG[num];
        this.state.age = num;
        this.state.coef = config.coef;
        this.state.meals = config.meals;

        // Start fetching products in background
        this.productPromise = this.fetchProducts(num);

        if (config.activity !== null) {
            // Kitten flow: skip weight/neutered/activity, go straight to weight then results
            this.state.activity = config.activity;
        }

        this.renderWeightStep(config.flow);
    }

    // ── Step 2: Weight ───────────────────────────────────────────────

    renderWeightStep(flow) {
        const content = el('div', { className: 'diet-builder-weight' });

        const img = el('img', {
            src: CAT_IMAGES.weight,
            className: 'diet-builder-weight__img',
            alt: 'Cat on scales',
        });

        const inputGroup = el('div', {
            className: 'diet-builder-weight__input-group',
        });
        const label = el(
            'p',
            { className: 'diet-builder-weight__label' },
            'kg',
        );
        const input = el('input', {
            id: 'weight_input',
            type: 'number',
            min: '0.5',
            max: '30',
            step: '0.1',
        });

        const errorMsg = el('p', {
            className: 'diet-builder-weight__error',
        });

        const buttonGroup = el('div', {
            className: 'diet-builder-weight__buttons',
        });
        const backBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => this.renderAgeStep(),
            },
            'Back',
        );
        const nextBtn = el(
            'button',
            {
                className: 'diet-builder-btn--primary',
                disabled: 'disabled',
                onClick: () => this.submitWeight(flow),
            },
            'Next',
        );

        // Validate weight input
        const validateWeight = () => {
            const raw = input.value.trim();
            if (raw === '') {
                errorMsg.textContent = 'Please enter your cat\u2019s weight.';
                errorMsg.style.display = 'block';
                nextBtn.disabled = true;
                return;
            }
            const val = parseFloat(raw);
            if (Number.isNaN(val) || val < 0.5 || val > 30) {
                errorMsg.textContent =
                    'Please enter a weight between 0.5 and 30 kg.';
                errorMsg.style.display = 'block';
                nextBtn.disabled = true;
                return;
            }
            errorMsg.textContent = '';
            errorMsg.style.display = 'none';
            nextBtn.disabled = false;
        };

        input.addEventListener('input', validateWeight);
        input.addEventListener('blur', validateWeight);

        buttonGroup.append(backBtn, nextBtn);
        inputGroup.append(label, input, buttonGroup, errorMsg);
        content.append(img, inputGroup);

        this.renderStep('How much does your cat weigh?', content);
        input.focus();
    }

    submitWeight(flow) {
        const input = document.getElementById('weight_input');
        this.state.weight = parseFloat(input.value);

        if (flow === 'kitten') {
            // Kittens skip neutered/activity — go to ingredients then results
            this.state.activity = 95;
            this.renderIngredientsStep(flow);
        } else {
            this.renderNeuteredStep(flow);
        }
    }

    // ── Step 3: Neutered ─────────────────────────────────────────────

    renderNeuteredStep(flow) {
        const content = el('div', { className: 'diet-builder-neutered' });

        const img = el('img', {
            src: CAT_IMAGES.neutered,
            className: 'diet-builder-neutered__img',
            alt: 'Cat illustration',
        });

        const buttonGroup = el('div', {
            className: 'diet-builder-neutered__buttons',
        });
        const yesBtn = el(
            'button',
            {
                className: 'diet-builder-btn--primary',
                onClick: () => this.selectNeutered(true, flow),
            },
            'Yes',
        );
        const noBtn = el(
            'button',
            {
                className: 'diet-builder-btn--primary',
                onClick: () => this.selectNeutered(false, flow),
            },
            'No',
        );

        const backBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => this.renderWeightStep(flow),
            },
            'Back',
        );

        buttonGroup.append(yesBtn, noBtn, backBtn);
        content.append(img, buttonGroup);

        this.renderStep('Is your cat spayed / neutered?', content);
    }

    selectNeutered(isNeutered, flow) {
        this.state.neutered = isNeutered;

        if (flow === 'adolescent') {
            // Adolescents skip activity level
            this.state.activity = isNeutered ? 87.5 : 95;
            this.renderIngredientsStep(flow);
        } else {
            this.renderActivityStep();
        }
    }

    // ── Step 4: Activity ─────────────────────────────────────────────

    renderActivityStep() {
        const content = el('div', { className: 'diet-builder-activity' });

        const img = el('img', {
            src: CAT_IMAGES.activity,
            className: 'diet-builder-activity__img',
            alt: 'Two cats playing',
        });

        const levels = [
            { label: 'Not Much', key: 'low' },
            { label: 'Moderately', key: 'moderate' },
            { label: 'Active', key: 'active' },
        ];

        const buttonGroup = el('div', {
            className: 'diet-builder-activity__buttons',
        });
        levels.forEach(({ label, key }) => {
            const btn = el(
                'button',
                {
                    className: 'diet-builder-btn--primary',
                    onClick: () => this.selectActivity(key),
                },
                label,
            );
            buttonGroup.appendChild(btn);
        });

        const backBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => this.renderNeuteredStep('adult'),
            },
            'Back',
        );

        buttonGroup.appendChild(backBtn);

        content.append(img, buttonGroup);
        this.renderStep('How active is your cat?', content);
    }

    selectActivity(level) {
        const group = this.state.neutered ? 'neutered' : 'intact';
        this.state.activity = ACTIVITY_VALUES[group][level];
        this.renderIngredientsStep('adult');
    }

    // ── Step 5: Ingredients ──────────────────────────────────────────

    renderIngredientsStep(flow) {
        const content = el('div', { className: 'diet-builder-ingredients' });

        const grid = el('div', {
            className: 'diet-builder-ingredients__grid',
        });

        for (const ingredient of this.allIngredients) {
            const isSelected = this.state.unwantedIngredients.includes(
                String(ingredient),
            );
            const card = el(
                'button',
                {
                    className: `diet-builder-ingredients__card${
                        isSelected
                            ? ' diet-builder-ingredients__card--selected'
                            : ''
                    }`,
                    onClick: () => {
                        this.state.unwantedIngredients.push(String(ingredient));
                        card.classList.toggle(
                            'diet-builder-ingredients__card--selected',
                        );
                    },
                },
                String(ingredient),
            );
            grid.appendChild(card);
        }

        const buttonGroup = el('div', {
            className: 'diet-builder-ingredients__buttons',
        });

        const backBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => this.goBackFromIngredients(flow),
            },
            'Back',
        );

        const skipBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => {
                    this.state.unwantedIngredients = [];
                    this.renderHealthStep(flow);
                },
            },
            'Skip',
        );

        const nextBtn = el(
            'button',
            {
                className: 'diet-builder-btn--primary',
                onClick: () => this.submitIngredients(flow),
            },
            'Next',
        );

        buttonGroup.append(backBtn, skipBtn, nextBtn);
        content.append(grid, buttonGroup);

        this.renderStep('Any ingredients your cat dislikes?', content);
    }

    submitIngredients(flow) {
        const cards = document.querySelectorAll(
            '.diet-builder-ingredients__card--selected',
        );
        this.state.unwantedIngredients = [...cards].map(
            (card) => card.textContent,
        );
        this.renderHealthStep(flow);
    }

    goBackFromIngredients(flow) {
        if (flow === 'kitten') {
            this.renderWeightStep(flow);
        } else if (flow === 'adolescent') {
            this.renderNeuteredStep(flow);
        } else {
            this.renderActivityStep();
        }
    }

    // ── Step 6: Health Conditions ────────────────────────────────────

    renderHealthStep(flow) {
        const content = el('div', { className: 'diet-builder-health' });

        const grid = el('div', {
            className: 'diet-builder-health__grid',
        });

        const selected = new Set(this.state.healthConditions);

        HEALTH_CONDITIONS.forEach((condition) => {
            const isSelected = selected.has(condition);
            const card = el(
                'button',
                {
                    className: `diet-builder-health__card${
                        isSelected ? ' diet-builder-health__card--selected' : ''
                    }`,
                    onClick: () => {
                        card.classList.toggle(
                            'diet-builder-health__card--selected',
                        );
                    },
                },
                condition,
            );
            grid.appendChild(card);
        });

        const buttonGroup = el('div', {
            className: 'diet-builder-health__buttons',
        });

        const backBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => this.renderIngredientsStep(flow),
            },
            'Back',
        );

        const skipBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => {
                    this.state.healthConditions = [];
                    this.calculateAndShowResults();
                },
            },
            'Skip',
        );

        const nextBtn = el(
            'button',
            {
                className: 'diet-builder-btn--primary',
                onClick: () => this.submitHealth(),
            },
            'Next',
        );

        buttonGroup.append(backBtn, skipBtn, nextBtn);
        content.append(grid, buttonGroup);

        this.renderStep('Does your cat have any health conditions?', content);
    }

    submitHealth() {
        const cards = document.querySelectorAll(
            '.diet-builder-health__card--selected',
        );
        this.state.healthConditions = [...cards].map(
            (card) => card.textContent,
        );
        this.calculateAndShowResults();
    }

    // ── Step 7: Results ──────────────────────────────────────────────

    calculateAndShowResults() {
        const { weight, activity, coef } = this.state;
        const { total, kcal } = calculateRDA(weight, activity, coef);
        this.state.total = total;
        this.state.kcal = kcal;
        this.renderResultsStep();
    }

    renderResultsStep() {
        const { total, kcal, meals } = this.state;

        const content = el('div', { className: 'diet-builder-results' });
        const inner = el('div', { className: 'diet-builder-results__inner' });

        // Serving
        const servingRow = el(
            'div',
            { className: 'diet-builder-results__row' },
            el(
                'p',
                {},
                'Serving per day: ',
                el('span', {}, el('strong', {}, `${total}g`)),
            ),
        );

        // Meals
        const mealsRow = el(
            'div',
            { className: 'diet-builder-results__meals' },
            el('p', {}, meals),
        );

        // Calories
        const caloriesRow = el(
            'div',
            { className: 'diet-builder-results__row' },
            el(
                'p',
                {},
                'Daily calorie intake: ',
                el('span', {}, el('strong', {}, `${kcal} kcal`)),
            ),
        );

        // Start Over button
        const startOverBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => {
                    this.resetState();
                    this.renderAgeStep();
                },
            },
            'Start Over',
        );

        inner.append(servingRow, mealsRow, caloriesRow, startOverBtn);
        content.appendChild(inner);

        // Products CTA
        const ctaContainer = el('div', {
            className: 'diet-builder-cta-container',
        });
        const ctaBtn = el(
            'button',
            {
                className:
                    'diet-builder-cta diet-builder-btn--secondary diet-builder-cta--loading',
                title: 'loading... please wait',
                onClick: () => this.showProductModal(),
            },
            'View your RDA on our products',
            el('span', { className: 'diet-builder-spinner' }),
        );
        ctaContainer.appendChild(ctaBtn);
        content.appendChild(ctaContainer);

        // Product modal container
        const modalContainer = el('div', {
            id: 'diet-builder-modal',
            className: 'diet-builder-modal',
        });
        const modalInner = el('div', {
            id: 'diet-builder-modal-content',
            className: 'diet-builder-modal__inner',
        });
        modalContainer.appendChild(modalInner);
        content.appendChild(modalContainer);

        this.renderStep('Your Recommended Daily Amount (RDA) is...', content);

        // Wait for products to load, then enable the CTA
        this.enableProductCTA(ctaBtn);
    }

    async enableProductCTA(ctaBtn) {
        if (this.productPromise) {
            await this.productPromise;
        }

        const loadingSpinner = ctaBtn.querySelector('.diet-builder-spinner');
        if (loadingSpinner) loadingSpinner.style.display = 'none';
        ctaBtn.classList.remove('diet-builder-cta--loading');
        ctaBtn.removeAttribute('title');
    }

    // ── Product Modal ────────────────────────────────────────────────

    showProductModal() {
        const modal = document.getElementById('diet-builder-modal');
        const modalInner = document.getElementById(
            'diet-builder-modal-content',
        );
        if (!modal || !modalInner) return;

        modal.style.display = 'block';
        modalInner.innerHTML = '';

        const content = el('div', {
            className: 'diet-builder-modal__content',
        });

        // Tubs section
        content.appendChild(
            this.buildProductSection('450g Tubs', this.products.tubs),
        );
        content.appendChild(el('hr'));

        // Pouches section
        content.appendChild(
            this.buildProductSection('Pouches', this.products.pouches),
        );
        content.appendChild(el('hr'));

        modalInner.appendChild(content);
    }

    buildProductSection(title, products) {
        const section = el('div', {
            className: 'diet-builder-product-section',
        });

        const titleEl = el(
            'h1',
            { className: 'diet-builder-product-section__title' },
            title,
        );
        section.appendChild(titleEl);

        const grid = el('div', {
            className: 'diet-builder-product-grid',
        });

        if (!products || products.length === 0) {
            const emptyMsg = el(
                'div',
                { className: 'diet-builder-product-card' },
                el('p', {}, 'No product found'),
            );
            grid.appendChild(emptyMsg);
        } else {
            products.forEach((product) => {
                grid.appendChild(this.buildProductCard(product));
            });
        }

        section.appendChild(grid);
        return section;
    }

    buildProductCard(product) {
        const { weight, activity, coef } = this.state;
        const gramsPerDay = calculateProductGrams(
            weight,
            activity,
            coef,
            product.calorie,
        );

        const wrapper = el('div', { className: 'diet-builder-product-card' });

        // Image
        const imageWrap = el('div', {
            className: 'diet-builder-product-card__image',
        });
        const imgLink = el('a', { href: product.action_url });
        const img = el('img', {
            src: product.image,
            alt: product.name,
        });
        imgLink.appendChild(img);
        imageWrap.appendChild(imgLink);

        // Name
        const contentWrap = el('div', {
            className: 'diet-builder-product-card__name',
        });
        const nameLink = el('a', { href: product.action_url });
        const nameP = el('p', {}, product.name);
        nameLink.appendChild(nameP);
        contentWrap.appendChild(nameLink);

        // CTA button
        const ctaWrap = el('div', {
            className: 'diet-builder-product-card__cta',
        });
        const ctaLink = el('a', { href: product.action_url });
        const ctaBtn = el(
            'button',
            {
                className: 'diet-builder-btn--primary',
                dataset: { calorie: product.calorie },
            },
            `${gramsPerDay}g per day`,
        );
        ctaLink.appendChild(ctaBtn);
        ctaWrap.appendChild(ctaLink);

        wrapper.append(imageWrap, contentWrap, ctaWrap);
        return wrapper;
    }
}
