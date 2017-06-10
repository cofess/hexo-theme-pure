var gulp         = require('gulp')
var rev          = require('gulp-rev')
var revNapkin    = require('gulp-rev-napkin')
var config       = require('../../config').rev

if (!config) return

/**
 * rev all asset files and
 * write a manifest file
 */
gulp.task('rev', function() {
  return gulp.src(config.src.assets, { base: config.src.base })
    .pipe(gulp.dest(config.dest.assets))
    .pipe(rev())
    .pipe(gulp.dest(config.dest.assets))
    .pipe(revNapkin())
    .pipe(rev.manifest({ path: config.dest.manifest.name }))
    .pipe(gulp.dest(config.dest.manifest.path));
});
