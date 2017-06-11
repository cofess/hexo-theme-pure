var fs             = require('fs')
var path           = require('path')
var normalize      = require('normalize-path')
var gulp           = require('gulp')
var concat         = require('gulp-concat')
var sourcemap      = require('gulp-sourcemaps')
var rename         = require('gulp-rename')
var config         = require('../../config').js


if (!config) return
var exclude = path.normalize('!**/{' + config.excludeFolders.join(',') + '}/**');

var list = [];

function getFolders(dir) {
  fs.readdirSync(dir)
    .filter(function(file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        getFolders(path.join(dir, file));
        list.push({
          fullPath: normalize(path.join(dir, file)).replace('src/', '/'),
          parentFolderName: path.join(dir, file).split(path.sep).slice(-1)[0]
        });
      }
    });
  return list;
}

gulp.task('jsconcat', function() {
  return getFolders(config.folder).map(function(subfolder) {
    console.log(exclude);
    return gulp.src(subfolder.fullPath + '/*.js')
      .pipe(sourcemap.init())
      .pipe(concat(subfolder.parentFolderName + '.js'))
      .pipe(sourcemap.write())
      .pipe(gulp.dest(config.dest));
  });
});
/**
 * Copy and minimize JS files
 */
// gulp.task('jsconcat', function() {
//   return gulp.src(config.src)
//     .pipe(sourcemap.init())
//     .pipe(sourcemap.write('./'))
//     .pipe(gulp.dest(config.dest));
// });
