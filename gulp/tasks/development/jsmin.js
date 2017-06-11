var path           = require('path')
var gulp           = require('gulp')
var uglify         = require('gulp-uglify')
var size           = require('gulp-size')
var rename         = require('gulp-rename')
var config         = require('../../config').js


if (!config) return

/**
 * Copy and minimize JS files
 */
gulp.task('jsmin', function() {
  return gulp.src([path.join(config.dest,'/*.js'),'!'+config.dest+'/*.min.js'])
    .pipe(uglify(config.options.uglify))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(config.dest))
    .pipe(size());
});