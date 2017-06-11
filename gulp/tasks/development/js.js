var path           = require('path')
var gulp           = require('gulp')
var sourcemap      = require('gulp-sourcemaps')
var rename         = require('gulp-rename')
var gulpif         = require('gulp-if')
var config         = require('../../config').js


if (!config) return

/**
 * Copy and minimize JS files
 */
gulp.task('js', function() {
  browsersync.notify('Compiling JavaScript');
  return gulp.src(config.src)
    .pipe(gulpif('!*min.js',sourcemap.init()))
    .pipe(gulpif('!*min.js',sourcemap.write('./')))
    .pipe(gulp.dest(config.dest));
});