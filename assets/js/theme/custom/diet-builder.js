/* eslint-disable function-paren-newline */
import PageManager from '../page-manager';

// ── Constants ────────────────────────────────────────────────────────
const KCAL_PER_KG = 1500;

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

// eslint-disable-next-line no-unused-vars
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
            catName: null,
            ageGroup: null,
            weight: null,
            coef: null,
            activity: null,
            neutered: null,
            meals: null,
            total: null,
            kcal: null,
            unwantedIngredients: [],
            healthConditions: [],
            recommendedProducts: [],
        };

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

        this.renderAgeStep();
    }

    // ── State Management ─────────────────────────────────────────────

    resetState() {
        this.state = {
            age: null,
            catName: null,
            ageGroup: null,
            weight: null,
            coef: null,
            activity: null,
            neutered: null,
            meals: null,
            total: null,
            kcal: null,
            unwantedIngredients: [],
            healthConditions: [],
            recommendedProducts: [],
        };
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
                                prices {
                                    price {
                                    value
                                    }
                                }
                                defaultImage {
                                    urlOriginal
                                }
                                categories {
                                    edges {
                                        node {
                                            name
                                        }
                                    }
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
                    const categories = node.categories.edges.map(
                        (edge) => edge.node.name,
                    );

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

                    // Only include products marked for the diet builder
                    if (!customFields.Dietbuilder) return;

                    const suitableForCondition =
                        customFields.Suitableforcondition
                            ? customFields.Suitableforcondition.split(',')
                                  .map((s) => s.trim())
                                  .filter(Boolean)
                            : [];

                    allProducts.push({
                        entityId: node.entityId,
                        name: node.name,
                        path: node.path,
                        image: node.defaultImage?.urlOriginal || '',
                        customFields,
                        categories,
                        Suitableforcondition: suitableForCondition,
                        price: node.prices.price.value,
                    });
                });

                hasNextPage = pageInfo.hasNextPage;
                cursor = pageInfo.endCursor;
            } catch (err) {
                hasNextPage = false;
            }
        }

        return allProducts;
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
        const form = el(
            'form',
            { className: 'diet-builder-age-form' },
            el('label', { for: 'cat-name' }, "What's your cat's name?"),
            el('input', {
                type: 'text',
                id: 'cat-name',
                name: 'catName',
                placeholder: 'e.g. Whiskers',
                required: true,
            }),
            el(
                'p',
                { className: 'diet-builder-age-form__dob-label' },
                "What's their date of birth?",
            ),
            el(
                'div',
                { className: 'diet-builder-dob' },
                el('input', {
                    type: 'number',
                    id: 'dob-day',
                    name: 'day',
                    placeholder: 'DD',
                    min: 1,
                    max: 31,
                    required: true,
                }),
                el('input', {
                    type: 'number',
                    id: 'dob-month',
                    name: 'month',
                    placeholder: 'MM',
                    min: 1,
                    max: 12,
                    required: true,
                }),
                el('input', {
                    type: 'number',
                    id: 'dob-year',
                    name: 'year',
                    placeholder: 'YYYY',
                    min: 2000,
                    max: new Date().getFullYear(),
                    required: true,
                }),
            ),
            el(
                'button',
                { type: 'submit', className: 'diet-builder-btn--primary' },
                'Next',
            ),
        );

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitAgeForm();
        });

        this.renderStep('Tell us about your cat', form);
    }

    submitAgeForm() {
        const catName = document.getElementById('cat-name').value.trim();
        const day = parseInt(document.getElementById('dob-day').value, 10);
        const month = parseInt(document.getElementById('dob-month').value, 10);
        const year = parseInt(document.getElementById('dob-year').value, 10);

        const dob = new Date(year, month - 1, day);
        const ageInMs = Date.now() - dob.getTime();
        const ageInMonths = ageInMs / (1000 * 60 * 60 * 24 * 30.44);

        let ageKey;
        if (ageInMonths < 2) ageKey = 1;
        else if (ageInMonths < 4) ageKey = 2;
        else if (ageInMonths < 9) ageKey = 3;
        else if (ageInMonths < 12) ageKey = 4;
        else ageKey = 5;

        let ageGroup;
        if (ageInMonths < 9) ageGroup = 'Kitten';
        else if (ageInMonths < 120) ageGroup = 'Adult';
        else ageGroup = 'Senior';

        const config = AGE_CONFIG[ageKey];

        this.state.catName = catName;
        this.state.ageGroup = ageGroup;
        this.state.age = ageKey;
        this.state.coef = config.coef;
        this.state.meals = config.meals;

        if (config.activity !== null) {
            this.state.activity = config.activity;
        }

        this.state.recommendedProducts = this.allProducts.filter((product) =>
            product.categories.includes(ageGroup),
        );

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
            // Kittens skip neutered/activity — go to health then ingredients then results
            this.state.activity = 95;
            this.renderHealthStep(flow);
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
            this.renderHealthStep(flow);
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
        this.renderHealthStep('adult');
    }

    // ── Step 6: Ingredients ──────────────────────────────────────────

    renderIngredientsStep(flow) {
        // If health conditions wiped out all products, show an error and let
        // the user go back to health conditions with a clean slate.
        if (this.state.recommendedProducts.length === 0) {
            const content = el('div', {
                className: 'diet-builder-ingredients',
            });
            const msg = el(
                'p',
                { className: 'diet-builder-ingredients__description' },
                'Unfortunately, no products match the combination of health conditions you selected. Please go back and adjust your selections.',
            );
            const backBtn = el(
                'button',
                {
                    className: 'diet-builder-btn--secondary',
                    onClick: () => {
                        this.state.recommendedProducts =
                            this.allProducts.filter((product) =>
                                product.categories.includes(
                                    this.state.ageGroup,
                                ),
                            );
                        this.renderHealthStep(flow);
                    },
                },
                'Back',
            );
            content.append(msg, backBtn);
            this.renderStep('No products available', content);
            return;
        }

        // Populate allIngredients from current recommendedProducts only
        this.allIngredients = new Set();
        this.state.recommendedProducts.forEach((product) => {
            const ingredients = product.customFields?.Ingredients;
            if (ingredients) {
                ingredients.forEach((value) => this.allIngredients.add(value));
            }
        });

        const content = el('div', { className: 'diet-builder-ingredients' });

        const description = el(
            'p',
            { className: 'diet-builder-ingredients__description' },
            "These are the ingredients found in products suited to your cat. Select any your cat doesn't like.",
        );

        const grid = el('div', {
            className: 'diet-builder-ingredients__grid',
        });

        const limitMsg = el(
            'p',
            { className: 'diet-builder-health__limit-msg' },
            'At least one ingredient must remain unselected to ensure we have options for your cat.',
        );
        limitMsg.style.visibility = 'hidden';

        for (const ingredient of this.allIngredients) {
            const isSelected =
                this.state.unwantedIngredients.includes(ingredient);
            const card = el(
                'button',
                {
                    className: `diet-builder-ingredients__card${
                        isSelected
                            ? ' diet-builder-ingredients__card--selected'
                            : ''
                    }`,
                    onClick: () => {
                        const alreadySelected = card.classList.contains(
                            'diet-builder-ingredients__card--selected',
                        );
                        if (alreadySelected) {
                            card.classList.remove(
                                'diet-builder-ingredients__card--selected',
                            );
                            this.state.unwantedIngredients =
                                this.state.unwantedIngredients.filter(
                                    (i) => i !== ingredient,
                                );
                            limitMsg.style.visibility = 'hidden';
                        } else {
                            const selectedCount = grid.querySelectorAll(
                                '.diet-builder-ingredients__card--selected',
                            ).length;
                            if (selectedCount >= this.allIngredients.size - 1) {
                                limitMsg.style.visibility = 'visible';
                                return;
                            }
                            card.classList.add(
                                'diet-builder-ingredients__card--selected',
                            );
                            this.state.unwantedIngredients.push(ingredient);
                        }
                    },
                },
                ingredient,
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
                    this.calculateAndShowResults();
                },
            },
            'Skip',
        );

        const nextBtn = el(
            'button',
            {
                className: 'diet-builder-btn--primary',
                onClick: () => this.calculateAndShowResults(),
            },
            'Next',
        );

        buttonGroup.append(backBtn, skipBtn, nextBtn);
        content.append(description, grid, limitMsg, buttonGroup);

        this.renderStep('Which ingredients does your cat dislike?', content);
    }

    goBackFromIngredients(flow) {
        this.renderHealthStep(flow);
    }

    // ── Step 5: Health Conditions ────────────────────────────────────

    renderHealthStep(flow) {
        const content = el('div', { className: 'diet-builder-health' });

        const grid = el('div', {
            className: 'diet-builder-health__grid',
        });

        const selected = new Set(this.state.healthConditions);

        const limitMsg = el(
            'p',
            { className: 'diet-builder-health__limit-msg' },
            'You can select a maximum of 2 health conditions. Deselect one to choose another.',
        );

        HEALTH_CONDITIONS.forEach((condition) => {
            const isSelected = selected.has(condition);
            const card = el(
                'button',
                {
                    className: `diet-builder-health__card${
                        isSelected ? ' diet-builder-health__card--selected' : ''
                    }`,
                    onClick: () => {
                        if (this.state.healthConditions.includes(condition)) {
                            this.state.healthConditions =
                                this.state.healthConditions.filter(
                                    (c) => c !== condition,
                                );
                            card.classList.remove(
                                'diet-builder-health__card--selected',
                            );
                            limitMsg.style.visibility = 'hidden';
                        } else if (this.state.healthConditions.length < 2) {
                            this.state.healthConditions.push(condition);
                            card.classList.add(
                                'diet-builder-health__card--selected',
                            );
                        } else {
                            limitMsg.style.visibility = 'visible';
                        }
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
                onClick: () => this.goBackFromHealth(flow),
            },
            'Back',
        );

        const skipBtn = el(
            'button',
            {
                className: 'diet-builder-btn--secondary',
                onClick: () => {
                    this.state.healthConditions = [];
                    this.renderIngredientsStep(flow);
                },
            },
            'Skip',
        );

        const nextBtn = el(
            'button',
            {
                className: 'diet-builder-btn--primary',
                onClick: () => this.submitHealth(flow),
            },
            'Next',
        );

        buttonGroup.append(backBtn, skipBtn, nextBtn);
        content.append(grid, limitMsg, buttonGroup);

        this.renderStep('Does your cat have any health conditions?', content);
    }

    submitHealth(flow) {
        this.state.recommendedProducts = this.state.recommendedProducts.filter(
            (product) =>
                this.state.healthConditions.every((condition) =>
                    product.Suitableforcondition.includes(condition),
                ),
        );

        this.renderIngredientsStep(flow);
    }

    goBackFromHealth(flow) {
        if (flow === 'kitten') {
            this.renderWeightStep(flow);
        } else if (flow === 'adolescent') {
            this.renderNeuteredStep(flow);
        } else {
            this.renderActivityStep();
        }
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
        const content = el(
            'div',
            {},
            el(
                'pre',
                {
                    style: 'background:#f4f4f4;padding:1rem;overflow:auto;font-size:12px;',
                },
                JSON.stringify(this.state, null, 2),
            ),
            el(
                'form',
                { className: 'diet-builder-email-form' },
                el(
                    'label',
                    { htmlFor: 'diet-builder-email' },
                    'Enter your email to receive your results:',
                ),
                el('input', {
                    type: 'email',
                    id: 'diet-builder-email',
                    name: 'email',
                    placeholder: 'your@email.com',
                    required: true,
                }),
                el(
                    'button',
                    { type: 'submit', className: 'diet-builder-btn--primary' },
                    'Submit',
                ),
            ),
        );

        this.renderStep('Almost done!', content);
    }
}
