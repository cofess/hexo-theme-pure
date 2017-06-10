"use strict";

var fs             = require('fs')
var path           = require('path')
var browserSync    = require('browser-sync')
var gulp           = require('gulp')
var data           = require('gulp-data')
var render         = require('gulp-nunjucks-render')
var config         = require('../../config').html

if (!config) return

var exclude = path.normalize('!**/{' + config.excludeFolders.join(',') + '}/**')

var paths = {
  src: [path.join(config.src, '/**/*.{' + config.extensions + '}'), exclude],
  dest: config.dest
}

var getData = function(file) {
  var dataPath = path.resolve(config.src, config.dataFile)
  return JSON.parse(fs.readFileSync(dataPath, 'utf8'))
}

var htmlTask = function() {
  return gulp.src(paths.src)
    .pipe(data(getData))
    .pipe(render({
      path: config.src,
      envOptions: {
        watch: false
      }
    }))
    .pipe(gulp.dest(paths.dest))
    .on('end', browserSync.reload)
}

gulp.task('html', htmlTask)
module.exports = htmlTask
