var gulp           = require('gulp')
var jshint         = require('gulp-jshint')
var stylish        = require('jshint-stylish')
var config         = require('../../config').jshint

if (!config) return

/**
 * Check JavaScript sytax with JSHint
 */
gulp.task('jshint', function() {
  return gulp.src(config.src)
    .pipe(jshint())
    .pipe(jshint.reporter(stylish, {beep: true}));
});
