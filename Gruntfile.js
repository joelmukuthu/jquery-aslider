'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    info: {
      banner: {
        dist: '/* <%= pkg.name %> v<%= pkg.version %>, (c) 2014-<%= grunt.template.today("yyyy") %> Joel Mukuthu, MIT License, built: <%= grunt.template.date("dd-mm-yyyy HH:MM:ss Z") %> */\n',
        dev: '/**\n * <%= pkg.name %>\n * Version: <%= pkg.version %>\n * (c) 2014-<%= grunt.template.today("yyyy") %> Joel Mukuthu\n * MIT License\n **/\n'
      }
    },

    // usebanner: {
    //   dist: {
    //     options: {
    //       position: 'top',
    //       replace: true,
    //       banner: '<%= info.banner.dev %>'
    //     },
    //     files: {
    //       src: ['<%= pkg.name %>.js']
    //     }
    //   }
    // },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      dist: {
        src: [
          'Gruntfile.js',
          '<%= pkg.name %>.js'
        ]
      }
    },

    uglify: {
      options: {
        banner: '<%= info.banner.dist %>'
      },
      dist: {
        src: ['<%= pkg.name %>.js'],
        dest: '<%= pkg.name %>.min.js'
      }
    },

    'release-it': {
        options: {
            pkgFiles: ['package.json', 'bower.json'],
            commitMessage: 'Release %s',
            tagName: 'v%s',
            tagAnnotation: 'Release %s',
            buildCommand: 'grunt build',
            dist: {
              baseDir: null
            }
        }
    }
  });

  grunt.registerTask('default', [
    'build'
  ]);

  grunt.registerTask('build', [
    // 'usebanner',
    'jshint',
    'uglify'
  ]);
};
