var gulp           = require('gulp')
var config         = require('../../config').watch

/**
 * Start browsersync task and then watch files for changes
 */
gulp.task('watch', ['browsersync'], function() {
  // gulp.watch(config.jekyll,  ['jekyll-rebuild']);
  gulp.watch(config.html,    ['html']);
  gulp.watch(config.styles,  ['styles', 'csslint', 'cssmin']);
  gulp.watch(config.scripts, ['js', 'jshint', 'jsmin']);
  gulp.watch(config.images,  ['images']);
  gulp.watch(config.fonts,   ['copy:fonts']);
  gulp.watch(config.static,  ['copy:static']);
  gulp.watch(config.sprites, ['sprites']);
  gulp.watch(config.html,    ['html']);
});
