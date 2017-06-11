var gulp         = require('gulp')
var sass         = require('gulp-sass')
var minify       = require('gulp-clean-css')
var plumber      = require('gulp-plumber')
var sourcemap    = require('gulp-sourcemaps')
var gutil        = require('gulp-util')
var browsersync  = require('browser-sync')
var autoprefixer = require('gulp-autoprefixer')
var config       = require('../../config').styles

if (!config) return

function onError(err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
}

gulp.task('styles', function() {
  return gulp.src(config.src)
    .pipe(plumber({
      errorHandler: onError
    }))
    .pipe(sourcemap.init())
    .pipe(sass(config.compile))
    .pipe(autoprefixer(config.options.autoprefixer))
    .pipe(minify(config.options.clean))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest(config.dest));
});
