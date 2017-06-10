"use strict";

var path           = require('path')
var gulp           = require('gulp')
var changed        = require('gulp-changed')
var config         = require('../../config').static

if (!config) return

var paths = {
  src: [
    path.join(config.src, '/**'),
    path.join('!' + config.src, '/README.md')
  ],
  dest: config.dest
}

var staticTask = function() {
  return gulp.src(paths.src)
    .pipe(changed(paths.dest)) // Ignore unchanged files
    .pipe(gulp.dest(paths.dest))
}

gulp.task('copy:static', staticTask)
module.exports = staticTask
