var gulp          = require('gulp')
var htmlmin       = require('gulp-htmlmin')
var config        = require('../../config').optimize.html

if (!config) return

/**
 * Minimize HTML
 */
gulp.task('optimize:html', function() {
  return gulp.src(config.src)
    .pipe(htmlmin(config.options))
    .pipe(gulp.dest(config.dest));
});
