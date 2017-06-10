var notify = require("gulp-notify")
var gutil = require("gulp-util")

module.exports = function (error) {
	//判断是否为数组
	function isArray (ar) {
	  return ar instanceof Array
	      || Array.isArray(ar)
	      || (ar && ar !== Object.prototype && isArray(ar.__proto__));
	}

	//去掉字符串数组所有字符串两头空格
	function TrimArray($arr){
	    if (!isArray($arr)){ return $arr; }
	    for (var key in $arr) {
			if (isArray($arr[key])){
	            $arr[key] = TrimArray($arr[key]);
	        }
	        else {
	            $arr[key] = $arr[key].trim();
	        }
		}
	    return $arr;
	}

    var lineNumber = (error.line) ? 'LINE ' + error.line + ' -- ' : '';

    notify({
        title: 'Task Failed [' + error.plugin + ']',
        message: lineNumber + 'See console.',
        sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
    }).write(error);

    gutil.beep(); // Beep 'sosumi' again

    // Pretty error reporting
    var report = '';
    var chalk = gutil.colors.red;

    report += chalk('TASK:') + ' [' + error.plugin + ']\n';
    if (error.file)   { report += chalk('FILE:') + ' ' + error.file + '\n'; }
    if (error.line) { report += chalk('LINE:') + ' ' + error.line + '\n'; }
    // report += chalk('PROB:') + ' ' + TrimArray(error.message.toString().split('\n       ')).join('\n') + '\n';
    report += chalk('PROB:') + ' ' + TrimArray(error.message.toString().split('\n       ')).splice(2,1).join('\n') + '\n';
    console.error(report);

    // Prevent the 'watch' task from stopping
    if (typeof this.emit === 'function') this.emit('end');
}

/**
 * Default handleErrors
 * 
 */
// var notify = require("gulp-notify")

// module.exports = function(errorObject, callback) {
//   notify.onError(errorObject.toString().split(': ').join(':\n')).apply(this, arguments)
//   // Keep gulp from hanging on this task
//   if (typeof this.emit === 'function') this.emit('end')
// }