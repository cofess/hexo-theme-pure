var path           = require('path')
var extend         = require('extend')
var gulp           = require('gulp')
var spritesmith    = require('gulp.spritesmith')
var merge          = require('merge-stream')
var folders        = require('gulp-folders')
var config         = require('../../config').sprites

if (!config) return

/**
 * Generate sprite and css file from PNGs
 * 只能处理单一目录
 */
// gulp.task('sprites', function() {

//   var spriteData = gulp.src(config.src).pipe(spritesmith(config.options));

//   spriteData.img
//     .pipe(gulp.dest(config.dest.image));

//   spriteData.css
//     .pipe(gulp.dest(config.dest.css));
// });

/**
 * Generate sprite and css file from PNGs
 * 按目录生成
 */
gulp.task(
  'sprites', folders(config.src, function(folder) {
    // Generate our spritesheet
    var spriteData = gulp.src(path.join(config.src, folder, '*.png'))
      .pipe(spritesmith(extend(config.options, {
        // retinaSrcFilter: [config.src+'/**/*@2x.png'],
        // retinaImgName: 'sprite_' + folder + '@2x.png', // retina sprites image
        imgName: '../images/sprite_' + folder + '.png',
        cssName: '_sprite_' + folder + '.scss',
      })));

    // Pipe image stream through image optimizer and onto disk
    var imgStream = spriteData.img
      // .pipe(imagemin({
      //     progressive: true,
      //     interlaced: true,
      //     optimizationLevel: 7,
      //     svgoPlugins: [{removeViewBox: false}, {removeUselessStrokeAndFill: false}],
      //     use: [pngquant({quality: '65-80', speed: 4})]
      // }))
      .pipe(gulp.dest(config.dest.image))
      // .pipe(notify({message: 'SPRITE IMG task complete', onLast: true}));

    // Pipe CSS stream through CSS optimizer and onto disk
    var cssStream = spriteData.css
      .pipe(gulp.dest(config.dest.css))
      // .pipe(notify({message: 'SPRITE SCSS task complete', onLast: true}));

    // Return a merged stream to handle both `end` events
    return merge(imgStream, cssStream);

  })
);
