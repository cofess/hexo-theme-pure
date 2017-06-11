var path           = require('path')
var gulp           = require('gulp')
var sourcemaps     = require('gulp-sourcemaps')
var rename         = require('gulp-rename')
var gulpif         = require('gulp-if')
var config         = require('../../config').js


if (!config) return

/**
 * Copy and minimize JS files
 */
gulp.task('js', function() {
  return gulp.src(config.src)
    .pipe(gulpif('!*min.js',sourcemaps.init()))
    .pipe(gulpif('!*min.js',sourcemaps.write('./')))
    .pipe(gulp.dest(config.dest));
});