var gulp           = require('gulp')
var stylelint      = require('gulp-stylelint')
var config         = require('../../config').csslint

if (!config) return

gulp.task('csslint', function() {
  return gulp.src(config.src)
    .pipe(stylelint(config.options.reporter));
});
