var gulp           = require('gulp')
var changed        = require('gulp-changed')
var config         = require('../../config').fonts.production

if (!config) return
	
/**
 * Copy fonts to folder
 */
gulp.task('copy:fonts:production', function() {
  return gulp.src(config.src)
  	.pipe(changed(config.dest)) // Ignore unchanged files
    .pipe(gulp.dest(config.dest));
});
