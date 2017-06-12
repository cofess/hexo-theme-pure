var path            = require('path')
var folders         = require('gulp-recursive-folder')
var gulp            = require('gulp')
var concat          = require('gulp-concat')
var sourcemap       = require('gulp-sourcemaps')
var config          = require('../../config').js.concat


if (!config) return

gulp.task('jsconcat', folders({
  base: config.folder,
  exclude: config.excludeFolders,
}, function(folder) {
  //This will loop over all folders inside pathToFolder main and recursively on the children folders, secondary 
  //With folderFound.name gets the folderName 
  //With folderFound.path gets all folder path found 
  //With folderFound.pathTarget gets the relative path beginning from options.pathFolder 
  return gulp.src(folder.path + "/*.js")
    .pipe(sourcemap.init())
    .pipe(concat(folder.name + ".js"))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest(config.dest));
}));
