var gulp          = require('gulp')
var collect       = require('gulp-rev-collector')
var config        = require('../../config').collect

if (!config) return

/**
 * Replace all links to assets in files
 * from a manifest file
 */
gulp.task('rev:collect', function() {
  return gulp.src(config.src)
    .pipe(collect())
    .pipe(gulp.dest(config.dest));
});
