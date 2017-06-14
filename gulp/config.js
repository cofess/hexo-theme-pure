var src               = 'app'; //源代码目录
var static            = 'app/_static';
var build             = 'build'; //构建目录
var development       = 'build/development';
var production        = 'build/production';
var srcAssets         = 'app/_assets';
var developmentAssets = 'build/assets';
var productionAssets  = 'build/production/assets';

//gulp 任务配置
module.exports = {
  //本地服务器
  browsersync: {
    development: {
      server: {
        baseDir: [development, build, src]
      },
      port: 9999,
      files: [
        developmentAssets + '/css/*.css',
        developmentAssets + '/js/*.js',
        developmentAssets + '/images/**',
        developmentAssets + '/fonts/*'
      ]
    },
    production: {
      server: {
        baseDir: [production]
      },
      port: 9998
    }
  },
  //是否开启调试
  debug: {
    state: true,
    options: {
      // prefix: 'Debug:',
      // timestamp: false,
      // 'zero-format': 'No files matched',
      // 'one-format': 'Total: ' + chalk.cyan('1 file'),
      // 'many-format': 'Total: ' + chalk.cyan('%s files')
      // format: '>' + chalk.yellow('%s')
    }
  },
  //清空构建目录
  delete: {
    src: [developmentAssets]
  },
  sizereport: {
    src:  [
      developmentAssets + '/css/*.css',
      developmentAssets + '/js/*.js',
    ],
    options: {
      gzip: true,
      '*': {
        'maxSize': 100000
      },
    }
  },
  static: {
    src: static,
    dest: build
  },
  fonts: {
    development: {
      src:  srcAssets + '/fonts/*',
      dest: developmentAssets + '/fonts'
    },
    production: {
      src:  developmentAssets + '/fonts/*',
      dest: productionAssets + '/fonts'
    }
  },
  styles: {
    src:  srcAssets + '/styles/*.scss',
    dest: developmentAssets + '/css',
    sourcemap: false, //是否生成sourcemap
    compile: {
      indentedSyntax: true,
      includePaths: [
        './node_modules/normalize.css'
      ]
    },
    // less: {
    //   src: "less",
    //   extensions: ["less" ,"css"],
    //   compile: {
    //     compress: true
    //   }
    // },
    // sass: {
    //   src: "sass",
    //   extensions: ["sass", "scss", "css"],
    //   compile: {
    //     indentedSyntax: true
    //   }
    // },
    options: {
      precss: {},
      clean: {
        debug: true,
        level: 0, // The level option can be either 0, 1 (default), or 2, e.g.
        compatibility: 'ie8', // Internet Explorer 8+ compatibility mode
        keepSpecialComments: 0,
        format: 'keep-breaks' // formats output the default way but adds line breaks for improved readability
      },
      minify: {
        debug: true,
        level: 2, // The level option can be either 0, 1 (default), or 2, e.g.
        compatibility: 'ie8', // Internet Explorer 8+ compatibility mode
        format: 'keep-breaks' // formats output the default way but adds line breaks for improved readability
      },
      autoprefixer: {
        browsers: [
          'last 2 versions',
          'safari 5',
          'ie 8',
          'ie 9',
          'opera 12.1',
          'ios 6',
          'android 4'
        ],
        cascade: true
      },
      mqpacker: {}
    }
  },
  csslint: {
    src: [
      developmentAssets + '/css/*css',
      '!' + developmentAssets + '/css/bootstrap.css',
      '!' + developmentAssets + '/css/*.min.css',
    ],
    options: {
      stylelint: {
        'rules': {
          'string-quotes': [2, 'double'],
          'color-hex-case': [2, 'lower'],
          'value-no-vendor-prefix': 2,
          'declaration-no-important': 0,
          'rule-non-nested-empty-line-before': [2, 'always', {
            ignore: ['after-comment']
          }]
        }
      },
      reporter: {
        clearMessages: true
      }
    }
  },
  js: {
    src: [
      srcAssets + '/javascripts/*.js',
      srcAssets + '/javascripts/vendor/*.js',
    ],
    dest: developmentAssets + '/js/',
    sourcemap: true, //是否生成sourcemap
    concat: {
      folder: srcAssets + '/javascripts/concat',
      excludeFolders: [],
      dest: developmentAssets + '/js/',
    },
    options: {
      uglify: {

      }
    }
  },
  //JS代码校验
  jshint: {
    src: srcAssets + '/javascripts/*.js'
  },
  images: {
    src:  srcAssets + '/images/**/*',
    dest: developmentAssets + '/images'
  },
  webp: {
    src: productionAssets + '/images/**/*.{jpg,jpeg,png}',
    dest: productionAssets + '/images/',
    options: {}
  },
  base64: {
    src: developmentAssets + '/css/*.css',
    dest: developmentAssets + '/css',
    options: {
      baseDir: build,
      extensions: ['png'],
      maxImageSize: 20 * 1024, // bytes
      debug: false
    }
  },
  sprites: {
    src: srcAssets + '/images/sprites',
    // src: srcAssets + '/images/sprites/icon/*.png',
    dest: {
      css: srcAssets + '/styles/partials/sprites/',
      image: developmentAssets + '/images'
    },
    options: {
      // cssName: '_sprites.scss',
      cssFormat: 'css',
      padding: 20,//图片间距
      algorithm: 'binary-tree', //图标排列方式，top-down、left-right、diagonal、alt-diagonal、binary-tree
      cssOpts: {
        cssSelector: function (item) {
          // If this is a hover sprite, name it as a hover one (e.g. 'home-hover' -> 'home:hover')
          if (item.name.indexOf('-hover') !== -1) {
            return '.' + item.name.replace('-hover', ':hover');
            // Otherwise, use the name as the selector (e.g. 'home' -> 'home')
          } else {
            return '.' + item.name;
          }
        }
      },
      // imgName: 'icon-sprite.png',
      // imgPath: '/assets/images/sprites/icon-sprite.png'
    }
  },
  html: {
    src: src,
    dest: build,
    dataFile: "_data/global.json",
    compile: {
      collapseWhitespace: true
    },
    extensions: ["html", "json"],
    excludeFolders: ["_layouts", "_includes", "_macros", "_bower_components", "_data"]
  },
  gzip: {
    // src: production + '/**/*.{html,xml,json,css,js}',
    src: [
      production + '/**/*',
      '!' + production + '/**/*.{zip,gz}',
      '!' + production + '/**/README.md',
    ],
    dest: production,
    filename : 'production',
    options: {
      extension: 'zip'
    }
  },
  optimize: {
    css: {
      src:  developmentAssets + '/css/*.css',
      dest: productionAssets + '/css/',
      options: {
        keepSpecialComments: 0
      }
    },
    js: {
      src:  developmentAssets + '/js/*.js',
      dest: productionAssets + '/js/',
      options: {}
    },
    images: {
      src:  developmentAssets + '/images/**/*.{jpg,jpeg,png,gif}',
      dest: productionAssets + '/images/',
      options: {
        optimizationLevel: 3,
        progessive: true,
        interlaced: true
      }
    },
    html: {
      src: production + '/**/*.html',
      dest: production,
      options: {
        collapseWhitespace: true
      }
    }
  },
  rev: {
    src: {
      assets: [
        productionAssets + '/css/*.css',
        productionAssets + '/js/*.js',
        productionAssets + '/images/**/*'
      ],
      base: production
    },
    dest: {
      assets: production,
      manifest: {
        name: 'rev.manifest.json',
        path: productionAssets
      }
    }
  },
  collect: {
    src: [
      productionAssets + '/manifest.json',
      production + '/**/*.{html,xml,txt,json,css,js}',
      '!' + production + '/feed.xml'
    ],
    dest: production
  },
  watch: {
    // jekyll: [
    //   '_config.yml',
    //   '_config.build.yml',
    //   'stopwords.txt',
    //   src + '/_data/**/*.{json,yml,csv}',
    //   src + '/_includes/**/*.{html,xml}',
    //   src + '/_layouts/*.html',
    //   src + '/_locales/*.yml',
    //   src + '/_plugins/*.rb',
    //   src + '/_posts/*.{markdown,md}',
    //   src + '/**/*.{html,markdown,md,yml,json,txt,xml}',
    //   src + '/*'
    // ],
    html: [
      src + '/_data/**/*.{json,yml,csv}',
      src + '/_includes/**/*.{html,xml}',
      src + '/_layouts/*.html',
      src + '/**/*.{html,markdown,md,yml,json,txt,xml}',
      src + '/*'
    ],
    static:  static + '/**/*',
    fonts:   srcAssets + '/fonts/**/*',
    styles:  srcAssets + '/styles/**/*.{css,scss,less}',
    scripts: srcAssets + '/javascripts/**/*.js',
    images:  srcAssets + '/images/**/*',
    sprites: srcAssets + '/images/**/*.png',
    // svg:     'vectors/*.svg'
  },
  rsync: {
    src: production + '/**',
    options: {
      destination: '~/path/to/my/website/root/',
      root: production,
      hostname: 'mydomain.com',
      username: 'user',
      incremental: true,
      progress: true,
      relative: true,
      emptyDirectories: true,
      recursive: true,
      clean: true,
      exclude: ['.DS_Store'],
      include: []
    }
  }
};
