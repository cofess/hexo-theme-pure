var gulp        = require('gulp')
var rsync       = require('gulp-rsync')
var config      = require('../../config').rsync

if (!config) return

/**
 * Copy files and folder to server
 * via rsync
 */
gulp.task('rsync', function() {
  return gulp.src(config.src)
    .pipe(rsync(config.options));
});
