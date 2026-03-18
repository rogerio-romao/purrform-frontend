/**
 * This is the Grunt configuration file for the project. It defines tasks for linting JavaScript and CSS files, as well as generating SVG sprites. The default task runs ESLint and SVG store tasks, it combines individual SVG files into a single SVG sprite sheet. Webpack doesn't do this natively, so Grunt handles it. Grunt is typically run as a pre-build step or during development when you need to regenerate the SVG sprite. The Stencil CLI internally invokes it at certain points, and it may also be wired into the watch process.
 */

module.exports = function gruntfile(grunt) {
    require('time-grunt')(grunt);
    require('load-grunt-config')(grunt);

    grunt.loadNpmTasks('grunt-run');
    grunt.loadNpmTasks('grunt-stylelint');
    grunt.registerTask('default', ['eslint', 'svgstore']);
};
