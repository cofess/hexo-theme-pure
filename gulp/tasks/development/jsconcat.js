var path           = require('path')
var folders        = require('gulp-folders')
var normalize      = require('normalize-path')
var gulp           = require('gulp')
var concat         = require('gulp-concat')
var sourcemap      = require('gulp-sourcemaps')
var config         = require('../../config').js


if (!config) return
var exclude = path.normalize('!**/{' + config.excludeFolders.join(',') + '}/**');

gulp.task('jsconcat', folders(config.folder, function(folder) {
  //This will loop over all folders inside pathToFolder main, secondary 
  //Return stream so gulp-folders can concatenate all of them 
  //so you still can use safely use gulp multitasking 
  console.log(exclude);
  return gulp.src([path.join(config.folder, folder, '*.js'), exclude])
    .pipe(sourcemap.init())
    .pipe(concat(folder + '.js'))
    .pipe(sourcemap.write('.'))
    .pipe(gulp.dest(config.dest));
}));
