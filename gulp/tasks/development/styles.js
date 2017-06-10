var gulp           = require('gulp')
var postcss        = require('gulp-postcss')
var precss         = require('precss')
var nano           = require('gulp-cssnano')
var plumber        = require('gulp-plumber')
var sourcemaps     = require('gulp-sourcemaps')
var gutil          = require('gulp-util')
var browsersync    = require('browser-sync')
var autoprefixer   = require('autoprefixer')
var mqpacker       = require('css-mqpacker') //Pack same CSS media query rules into one using PostCSS
var config         = require('../../config').styles

if (!config) return

function onError (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
}

/**
 * Rund CSS through PostCSS and it's plugins
 * Build sourcemaps and minimize
 */
var processors = [
  precss(config.options.precss),
  autoprefixer(config.options.autoprefixer),
  mqpacker(config.options.mqpacker)
];

gulp.task('styles', function () {
  browsersync.notify('Transforming CSS with PostCSS');

  return gulp.src(config.src)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemaps.init())
    .pipe(postcss(processors))
    .pipe(nano())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(config.dest));
});
