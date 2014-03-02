module.exports = function (grunt) {
  grunt.loadNpmTasks('grunt-simple-mocha');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-shell');

  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: require('./package.json'),
    jshint: {
      source: {
        src: ['server.js','app/**/*.js','config/**/*.js','learn/**/*.js'],
        ignores: ['src_old/**/*.js']
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
      src: 'test/**/*Spec.js',
      options: {
        reporter: 'spec'
      }
    },
    shell: {
      mule_update: {
        options: {                      // Options
          stdout: true
        },
        command: 'rm node_modules/mule* -rf && npm install'
      },
      clear_logs : {
        command: 'rm logs/mule*.log'
      }
    }
  });

  grunt.registerTask('start', ['watch']);
  grunt.registerTask('test', ['simplemocha']);
  grunt.registerTask('default', ['test']);
  grunt.registerTask('updateMule', ['shell:mule_update']);
  grunt.registerTask('clearLogs', ['shell:clear_logs'])
};
