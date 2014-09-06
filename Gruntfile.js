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
        command: 'rm -rf node_modules/mule* || npm install'
          + ' && git clone http://github.com/nik0kin/mule-utils.git node_modules/mule-utils'
          + ' && git clone http://github.com/nik0kin/mule-models.git node_modules/mule-models'
          + ' && git clone http://github.com/nik0kin/mule-rules.git node_modules/mule-rules'

          + ' && cd node_modules/mule-utils && npm install'
          + ' && cd ../mule-models && npm install'
          + ' && cd ../mule-rules && npm install'
          + ' && cd ../..'
      },
      updateRules: {
        command: 'rm -rf node_modules/mule-models/node_modules/mule-rules/*'
          + ' && cp -rf node_modules/mule-rules node_modules/mule-models/node_modules/mule-rules'
      },
      updateUtils: {
        command: 'rm -rf node_modules/mule-models/node_modules/mule-utils/*'
          + ' && cp -rf node_modules/mule-utils node_modules/mule-models/node_modules/mule-utils'
      },
      clear_logs : {
        command: 'rm logs/mule*.log'
      },
      monGO: {
        options: { stdout: true },
        command: 'sudo ~/mongodb/bin/mongod --fork --logpath /var/log/mongodb.log --logappend'
      },
      monDEL: {
        options: {  stdout: true },
        command: 'mongo mule_dev --eval "db.dropDatabase()" && mongo mule_test --eval "db.dropDatabase()"'
      }
    }
  });

  grunt.registerTask('start', ['watch']);
  grunt.registerTask('test', ['simplemocha']);
  grunt.registerTask('default', ['test']);
  grunt.registerTask('updateMule', ['shell:mule_update']);
  grunt.registerTask('updateRules', ['shell:updateRules']);
  grunt.registerTask('clearLogs', ['shell:clear_logs']);
  grunt.registerTask('monGO', ['shell:monGO']);
  grunt.registerTask('monDEL', ['shell:monDEL']);
};
