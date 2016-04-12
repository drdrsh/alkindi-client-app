module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        replace: {
            dist: {
                src: ['dist/style/style.css'],
                overwrite: true,
                replacements: [{
                    from: /\burl\([^)]+\)/gi,
                    to: function(x, y, z) {
                        var urlRegEx = /\((.*)\)/gi;
                        var parts = urlRegEx.exec(x);
                        if(parts.length != 2) {
                            return x;
                        }
                        var image = parts[1].replace(/"|'/ig, '');
                        var imlc = image.toLowerCase();
                        if(imlc.startsWith('http:') || imlc.startsWith('data:')) {
                            return x;
                        }
                        var imageBaseName = image.split('/').pop();
                        return 'url("../images/' + imageBaseName + '")';
                    }
                }]
            }
        },
        copy: {
            'dist': {
                files: [
                    // flattens results to a single level
                    {
                        expand: true,
                        flatten: true,
                        src: ['dev/**/*.png', 'dev/**/*.gif', 'dev/**/*.svg', 'dev/**/*.jpg'],
                        dest: 'dist/images',
                        filter: 'isFile'
                    }, {
                        src: 'dev/index.php',
                        dest: 'dist/index.php'
                    }, {
                        src: 'dev/favicon.ico',
                        dest: 'dist/favicon.ico'
                    }
                ]
            }
        },

		serve: {
			options: {
				port: 9000,
				serve: {
					path: './dev/'
				}
			}
		},

        "bower-install-simple": {
            options: {color: true},
            "dist": {options: {production: true}},
            "dev":  {options: {production: false}}
        },

        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1,
                processImport: false
            },
            dist: {
                files: {
                    'dist/style/style.css': ['dist/style/style.css']
                }
            }
        },

        processhtml: {
            options: {
                data: {
                    imagePath: './images/'
                }
            },
            dist: {
                files: {
                    'dist/index.html': ['dev/index.html']
                }
            }
        },

        concat_css: {
            options: {
                // Task-specific options go here.
            },
            dist: {
                dest : 'dist/style/style.css',
                src  : ['dev/assets/lib/vis/vis.css',
                    'dev/assets/lib/jquery-ui/jquery-ui.css',
                    'dev/assets/lib/simplebar/simplebar.css',
                    'dev/assets/app/css/style.css'
                ],
            }
        },

        concat: {
            "dist" : {
                options: {},
                files : {
                    'dist/js/scripts.js': [
                        "dev/assets/lib/jquery/jquery.js",
                        "dev/assets/lib/jquery-ui/jquery-ui.js",
                        "dev/assets/lib/jquery-calendars/jquery.calendars.js",
                        "dev/assets/lib/jquery-calendars/jquery.calendars.islamic.js",
                        "dev/assets/lib/jquery-calendars/jquery.calendars.julian.js",
                        "dev/assets/lib/vis/vis.js",
                        "dev/assets/lib/simplebar/simplebar.js",
                        "dev/assets/app/js/Language.js",
                        "dev/assets/app/language/ar.js",
                        "dev/assets/app/js/SearchManager.js",
                        "dev/assets/app/js/LocalStorage.js",
                        "dev/assets/app/js/main.js",
                        "dev/assets/app/js/HelpEngine.js",
                        "dev/assets/app/js/main-req.js",
                        "dev/assets/app/js/Config.js",
                        "dev/assets/app/js/template.js",
                        "dev/assets/app/js/main-vis.js"
                    ]
                }
            },
            "dev": {
                "jquery-ui": {
                    options: {
                        separator: ';'
                    },
                    src: [
                        'bower_components/jquery-ui/ui/core.js',
                        'bower_components/jquery-ui/ui/widget.js',
                        'bower_components/jquery-ui/ui/mouse.js',
                        'bower_components/jquery-ui/ui/position.js',
                        'bower_components/jquery-ui/ui/draggable.js',
                        'bower_components/jquery-ui/ui/resizable.js',
                        'bower_components/jquery-ui/ui/button.js',
                        'bower_components/jquery-ui/ui/dialog.js',
                        'bower_components/jquery-ui/ui/menu.js',
                        'bower_components/jquery-ui/ui/autocomplete.js'
                    ],
                    dest: 'bower_components/jquery-ui/jquery-ui.js'
                }
            }
        },


        uglify: {
            "dist" : {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
                },
                files: {
                    'dist/js/scripts.js': ['dist/js/scripts.js']
                }
            }
        },

        jshint: {
            all: ['./source/js/*.js'],
            options: {
                esnext: true
            }
        },

        bowercopy: {
            dev : {
                options: {
                    clean: false
                },
                files: {
                    "dev/assets/lib/jquery/jquery.js" : "./jquery/dist/jquery.js",

                    "dev/assets/lib/simplebar/simplebar.js" : "./simplebar/src/simplebar.js",
                    "dev/assets/lib/simplebar/simplebar.css" : "./simplebar/src/simplebar.css",

                    "dev/assets/lib/vis/vis.css" : "./vis/dist/vis.css",
                    "dev/assets/lib/vis/vis.js" :  "./vis/dist/vis.js",
                    "dev/assets/lib/vis/img/" :  "./vis/dist/img/**/*",

                    "dev/assets/lib/jquery-ui/jquery-ui.js" : "./jquery-ui/jquery-ui.js",
                    "dev/assets/lib/jquery-ui/jquery-ui.css" : "./jquery-ui/themes/start/jquery-ui.css",
                    "dev/assets/lib/jquery-ui/images" : "./jquery-ui/themes/start/images",

                    "dev/assets/lib/jquery-calendars/jquery.calendars.js":"./jq-calendars/jquery.calendars.js",
                    "dev/assets/lib/jquery-calendars/jquery.calendars.islamic.js": "./jq-calendars/jquery.calendars.islamic.js",
                    "dev/assets/lib/jquery-calendars/jquery.calendars.julian.js":  "./jq-calendars/jquery.calendars.julian.js"

                }
            }
        },

        "expand-in-place": {
            'dev': { //specify a target with any name
                target: ['dev/*.html']
            }
        }
    });

    grunt.loadNpmTasks('grunt-bower-install-simple');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-expand-in-place');
    grunt.loadNpmTasks('grunt-bowercopy');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-serve');
    
    // task setup 
    grunt.registerTask('dev', ['bower-install-simple:dev', 'concat:dev', 'bowercopy:dev', 'expand-in-place:dev']);
    grunt.registerTask('dist', [
        'dev',
        'copy:dist',
        'concat:dist',
        'concat_css:dist',
        'replace:dist',
        'uglify:dist',
        'cssmin:dist',
        'processhtml:dist'
    ]);
    grunt.registerTask('default', ['dev']);
};