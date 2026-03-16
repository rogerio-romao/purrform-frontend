/** @type {import('stylelint').Config} */
module.exports = {
    extends: ['stylelint-config-standard-scss'],

    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,

    rules: {
        'color-function-alias-notation': null,
        'color-function-notation': null,
        'declaration-no-important': true,
        'function-url-no-scheme-relative': true,
        'no-descending-specificity': null,
        'no-unknown-animations': true,
        'no-unknown-custom-media': true,
        'no-unknown-custom-properties': true,
        'media-feature-range-notation': null,
        'selector-class-pattern': null,
        'selector-id-pattern': null,
        'scss/dollar-variable-pattern': null,
        'keyframes-name-pattern': null,
    },
};
