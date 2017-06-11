var path           = require('path')
var gulp           = require('gulp')
var minify         = require('gulp-clean-css')
var plumber        = require('gulp-plumber')
// var sourcemap      = require('gulp-sourcemaps')
var gutil          = require('gulp-util')
var browsersync    = require('browser-sync')
// var autoprefixer   = require('autoprefixer')
var size           = require('gulp-size')
var rename         = require('gulp-rename')
var config         = require('../../config').styles

if (!config) return

function onError (err) {
  gutil.beep();
  console.log(err);
  this.emit('end');
}

gulp.task('cssmin', function () {
  browsersync.notify('Transforming CSS with CSS Minify');

  return gulp.src([path.join(config.dest,'/*.css'),'!'+config.dest+'/*.min.css'])
    .pipe(plumber({
      errorHandler: onError
    }))
    // .pipe(sourcemap.init())
    .pipe(minify(config.options.minify))
    // .pipe(sourcemap.write('.'))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(config.dest))
    .pipe(size())
});
