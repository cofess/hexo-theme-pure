var gulp           = require('gulp')
var changed        = require('gulp-changed')
var logger         = require('gulp-spy')
var gulpif         = require('gulp-if')
var debug          = require('../../config').debug
var config         = require('../../config').fonts.development

if (!config) return

/**
 * Copy fonts to folder
 */
// gulp.task('copy:fonts', ['fontcustom'], function() {
//   return gulp.src(config.src)
//     .pipe(gulp.dest(config.dest));
// });

gulp.task('copy:fonts', function() {
  return gulp.src(config.src)
    .pipe(gulpif(debug.state, logger(debug.options)))
    .pipe(changed(config.dest)) // Ignore unchanged files
    .pipe(gulp.dest(config.dest));
});
