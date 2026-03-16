module.exports = {
    options: {
        formatter: 'string',
        ignoreDisables: false,
        failOnError: true,
        outputFile: '',
        reportNeedlessDisables: false,
        fix: false,
    },
    src: [
        'assets/scss/**/*.scss',
        '!assets/scss/vendor/**/*.scss',
        '!assets/scss/invoice.scss',
        '!assets/scss/maintenance.scss',
    ],
};
