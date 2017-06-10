var gulp           = require('gulp')
var browsersync    = require('browser-sync')
var config         = require('../../config').browsersync.production

/**
 * Start a server and watch changes with BrowserSync
 */
gulp.task('browsersync:production', ['build:production'], function() {
  browsersync(config);
});
