/** @type {import('stylelint').Config} */
module.exports = {
    extends: ['stylelint-config-standard-scss'],

    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,

    rules: {
        'alpha-value-notation': null,
        'color-function-alias-notation': null,
        'color-function-notation': null,
        'declaration-no-important': true,
        'function-url-no-scheme-relative': true,
        'function-name-case': null,
        'no-descending-specificity': null,
        'no-unknown-animations': true,
        'no-unknown-custom-media': true,
        'no-unknown-custom-properties': true,
        'media-feature-range-notation': null,
        'selector-class-pattern': null,
        'selector-id-pattern': null,
        'scss/at-mixin-pattern': null,
        'scss/dollar-variable-pattern': null,
        'scss/at-mixin-argumentless-call-parentheses': null,
        'scss/percent-placeholder-pattern': null,
        'keyframes-name-pattern': null,
    },
};
