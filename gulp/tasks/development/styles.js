var gulp         = require('gulp')
var sass         = require('gulp-sass')
var minify       = require('gulp-clean-css')
var plumber      = require('gulp-plumber')
var sourcemap    = require('gulp-sourcemaps')
var gutil        = require('gulp-util')
var browsersync  = require('browser-sync')
var autoprefixer = require('gulp-autoprefixer')
var gulpif       = require('gulp-if')
var gcmq         = require('gulp-group-css-media-queries')
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
    .pipe(gulpif(config.sourcemap,sourcemap.init()))
    .pipe(sass(config.compile))
    .pipe(autoprefixer(config.options.autoprefixer))
    .pipe(minify(config.options.clean))
    .pipe(gcmq())
    .pipe(gulpif(config.sourcemap,sourcemap.write('.')))
    .pipe(gulp.dest(config.dest));
});
