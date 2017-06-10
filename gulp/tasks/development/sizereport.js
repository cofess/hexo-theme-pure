var gulp           = require('gulp')
var sizereport     = require('gulp-sizereport')
var config         = require('../../config').sizereport

if (!config) return

gulp.task('sizereport', function() {
  return gulp.src(config.src)
    .pipe(sizereport(config.options));
});
