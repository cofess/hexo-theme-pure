var gulp          = require('gulp')
var size          = require('gulp-size')
var config        = require('../../config').optimize.css

if (!config) return

/**
 * Copy CSS files
 */
gulp.task('optimize:css', function() {
  return gulp.src(config.src)
    .pipe(gulp.dest(config.dest))
    .pipe(size());
});
