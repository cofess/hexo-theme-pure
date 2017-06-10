var gulp           = require('gulp')
var base64         = require('gulp-base64')
var logger         = require('gulp-spy')
var gulpif         = require('gulp-if')
var debug          = require('../../config').debug
var config         = require('../../config').base64

if (!config) return

/**
  * Replace urls in CSS fies with base64 encoded data
  */
gulp.task('base64', ['styles'], function() {
  return gulp.src(config.src)
    .pipe(gulpif(debug.state, logger(debug.options)))
    .pipe(base64(config.options))
    .pipe(gulp.dest(config.dest));
});
