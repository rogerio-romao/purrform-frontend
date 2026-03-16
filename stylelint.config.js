/** @type {import('stylelint').Config} */
module.exports = {
    extends: ['stylelint-config-standard-scss'],

    reportDescriptionlessDisables: true,
    reportInvalidScopeDisables: true,
    reportNeedlessDisables: true,

    rules: {
        'declaration-no-important': true,
        'function-url-no-scheme-relative': true,
        'no-descending-specificity': null,
        'no-unknown-animations': true,
        'no-unknown-custom-media': true,
        'no-unknown-custom-properties': true,
    },
};
