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
              ' */\n'
    },
    clean: {
      build: ['public/build/**/*']
    },
    concat: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: ['public/js/config.js',
              'public/js/Network.js',
              'public/js/LoadingScreen.js',
              'public/js/MenuScreen.js',
              'public/js/PlayScreen.js',
              'public/js/Bullet.js',
              'public/js/Bonus.js',
              'public/js/Tank.js',
              'public/js/Friend.js',
              'public/js/Enemy.js',
              'public/js/Player.js',
              'public/js/main.js'],
        dest: 'public/build/<%= pkg.name %>.<%= pkg.version %>.js'
      }
    },
    uglify: {
      options: {
        banner: '<%= meta.banner %>'
      },
      dist: {
        src: '<%= concat.dist.dest %>',
        dest: 'public/build/<%= pkg.name %>.<%= pkg.version %>.min.js'
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
        es5: true
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
          src: '<%= concat.dist.src %>'
        },
        options: {
          globals: {
            me: true,
            io: true,
            game: true
          }
        }
      },

      clientAfterConcat: {
        files: {
          src: '<%= concat.dist.dest %>'
        },
        options: {
          globals: {
            me: true,
            io: true,
            game: true
          }
        }
      },

      smartphones: {
        files: {
          src: 'smartphones/**/*.js'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  
  // Default task.
  grunt.registerTask ('default', ['jshint:clientBeforeConcat',
                                  'clean',
                                  'concat',
                                  'jshint:clientAfterConcat',
                                  'uglify',
                                  'jshint:server',
                                  'jshint:shared',
                                  'jshint:smartphones']);


};
