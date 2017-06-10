var gulp          = require('gulp')
var uglify        = require('gulp-uglify')
var size          = require('gulp-size')
var config        = require('../../config').optimize.js


if (!config) return

/**
 * Copy and minimize JS files
 */
gulp.task('optimize:js', function() {
  return gulp.src(config.src)
    .pipe(uglify(config.options))
    .pipe(gulp.dest(config.dest))
    .pipe(size());
});
