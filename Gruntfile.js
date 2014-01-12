module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: require('./package.json'),
    jshint: {
      source: {
        src: ['server.js','*.js','app/**/*.js','config/**/*.js','learn/**/*.js']
      },
      tests: {
        src: ['test/**/*.js']
      }
    },
    watch: {
      src: {
        files: ['test/**/*.js', '*.js','app/**/*.js','config/**/*.js','learn/**/*.js'],
        tasks: ['jshint:source', 'jshint:tests', 'simplemocha']
      }
    },
    simplemocha: {
      src: 'test/**/*.js',
      options: {
        reporter: 'spec'
      }
    }
  });

  grunt.registerTask('start', ['watch']);
  grunt.registerTask('test', ['simplemocha']);
  grunt.registerTask('default', ['test']);
};
