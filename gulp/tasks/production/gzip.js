var gulp          = require('gulp')
var tar           = require('gulp-tar')
var gzip          = require('gulp-gzip')
var size          = require('gulp-size')
var config        = require('../../config').gzip

if (!config) return

/**
 * Gzip text files
 */
gulp.task('gzip', function() {
  return gulp.src(config.src)
    .pipe(tar(config.filename))
    .pipe(gzip(config.options))
    .pipe(gulp.dest(config.dest))
    .pipe(size());
});
