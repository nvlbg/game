module.exports = function(grunt) {
	// Project configuration.
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		meta: {
			banner: '/*!\n' +
					' * <%= pkg.name %>\n' +
					' *\n' +
					' * Version  : <%= pkg.version %>\n' +
					' * Created  : <%= grunt.template.today("yyyy-mm-dd") %>\n' +
					' * Source   : <%= pkg.homepage %>\n' +
					' * Author   : <%= pkg.author.name %> (<%= pkg.author.email %>)\n' + 
					' * Licensed : <%= pkg.licenses[0].name %> (<%= pkg.licenses[0].url %>)\n' +
					' */\n',
		},

		clean: {
			begin: ['public/build/**/*'],
			end: ['<%= concat.javascript.dest %>',
				  '<%= concat.css.dest %>',
				  '<%= concat.lib.dest %>']
		},

		concat: {
			options: {
				banner: '<%= meta.banner %>'
			},

			javascript: {
				src: ['public/js/config.js',
					  'public/js/Network.js',
					  'public/js/Chat.js',
					  'public/js/LoadingScreen.js',
					  'public/js/MenuScreen.js',
					  'public/js/PlayScreen.js',
					  'public/js/Bullet.js',
					  'public/js/Bonus.js',
					  'public/js/Tank.js',
					  'public/js/Friend.js',
					  'public/js/Enemy.js',
					  'public/js/EnemyBoy.js',
					  'public/js/Player.js',
					  'public/js/main.js'],
				dest: 'public/build/<%= pkg.name %>.<%= pkg.version %>.js'
			},

			css: {
				src: ['public/css/default.css',
					  'public/css/login.css',
					  'public/css/chat.css',
					  'public/css/apprise-1.5.min.css'],
				dest: 'public/build/<%= pkg.name %>.<%= pkg.version %>.css'
			},

			lib: {
				src: ['public/lib/apprise-1.5.min.js',
					  'public/lib/jquery-1.9.1.min.js',
					  'public/lib/melonJS-0.9.7-min.js'],
				dest: 'public/build/libs.js'
			}
		},

		uglify: {
			options: {
				banner: '<%= meta.banner %>'
			},

			public: {
				src: '<%= concat.javascript.dest %>',
				dest: 'public/build/js/game.min.js'
			},

			shared: {
				src: 'shared/constants.js',
				dest: 'public/build/js/shared.min.js'
			},

			smartphones: {
				src: 'smartphones/controller.js',
				dest: 'public/build/js/controller.min.js'
			},

			lib: {
				src: '<%= concat.lib.dest %>',
				dest: 'public/build/lib/libs.min.js'
			}
		},

		jshint: {
			options: {
				curly: true,
				eqeqeq: true,
				immed: true,
				latedef: true,
				newcap: false,
				noarg: true,
				sub: true,
				undef: true,
				boss: true,
				eqnull: true,
				browser: true,
				node: true,
				strict: false,
				es5: true,
				smarttabs: true
			},

			server: {
				options: {
					loopfunc: true,
					newcap: false,
					globals: {
						Game: true
					}
				},
				files: {
					src: ['Gruntfile.js', 'server.js', 'server/**/*.js']
				}
			},

			shared: {
				files: {
					src: 'shared/**/*.js'
				}
			},

			clientBeforeConcat: {
				files: {
					src: '<%= concat.javascript.src %>'
				},
				options: {
					globals: {
						me: true,
						io: true,
						game: true,
						$: true,
						dat: true,
						apprise: true
					}
				}
			},

			clientAfterConcat: {
				files: {
					src: '<%= concat.javascript.dest %>'
				},
				options: {
					globals: {
						me: true,
						io: true,
						game: true,
						$: true,
						dat: true,
						apprise: true
					}
				}
			},

			smartphones: {
				files: {
					src: 'smartphones/controller.js'
				}
			}
		},

		csslint: {
			options: {
				import: 2,
				ids: false
			},

			publicSrc: ['public/css/default.css',
						'public/css/login.css',
						'public/css/chat.css'],

			publicBeforeConcat: {
				options: {
					'universal-selector': false,
					'bulletproof-font-face': false,
					'important': false,
					'outline-none': false,
					'box-model': false
				},

				src: '<%= csslint.publicSrc %>'
			},

			publicAfterConcat: {
				options: {
					'universal-selector': false,
					'bulletproof-font-face': false,
					'important': false,
					'outline-none': false,
					'box-model': false
				},

				src: '<%= concat.css.dest %>'
			},

			smartphones: {
				src: ['smartphones/style.css']
			}
		},

		cssmin: {
			options: {
				banner: '<%= meta.banner %>'
			},

			public: {
				files: {
					'public/build/css/game.min.css': '<%= concat.css.dest %>'
				}
			},

			smartphones: {
				files: {
					'public/build/css/smartphones.min.css': '<%= csslint.smartphones.src %>'
				}
			}
		},

		htmllint: {
			all: ['public/index.html', 'smartphones/index.html']
		},

		htmlmin: {
			options: {
				removeComments: true,
				collapseWhitespace: true,
				collapseBooleanAttributes: true,
				useShortDoctype: true
			},

			dist: {
				files: {
					'public/build/index.html': 'public/index.html',
					'public/build/smartphones/index.html': 'smartphones/index.html'
				}
			}
		}
	});

	// Load tasks
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-html');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');

	// Default task
	grunt.registerTask('default', ['clean:begin',
								   'concat:lib',
								   'jshint:server',
								   'jshint:shared',
								   'jshint:smartphones',
								   'jshint:clientBeforeConcat',
								   'concat:javascript',
								   'jshint:clientAfterConcat',
								   'uglify',
								   'csslint:smartphones',
								   'csslint:publicBeforeConcat',
								   'concat:css',
								   'csslint:publicAfterConcat',
								   'cssmin',
								   'htmllint',
								   'htmlmin',
								   'clean:end']);
};
