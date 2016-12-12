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
          + ' && git clone git@github.com:nik0kin/mule-utils.git node_modules/mule-utils'
          + ' && git clone git@github.com:nik0kin/mule-models.git node_modules/mule-models'

          + ' && cd node_modules/mule-utils && npm install'
          + ' && cd ../mule-models && npm install'
          + ' && cd ../..'
      },
      updateUtils: {
        command: 'rm -rf node_modules/mule-models/node_modules/mule-utils/*'
          + ' && cp -rf node_modules/mule-utils/* node_modules/mule-models/node_modules/mule-utils'
      },
      gstatus: {
        options: { stdout: true },
        command: 'echo `pwd` && git status ' 
          + ' && cd node_modules/mule-models && echo `pwd` && git status'
          + ' && cd ../mule-utils && echo `pwd` && git status'
          + ' && cd ../..'
      },
      style: {
        command: 'jshint app/ ; jscs app/'
      },
      clear_logs : {
        command: 'rm logs/mule*.log'
      },
      monGO: {
        options: { stdout: true },
        command: 'sudo mongod --fork --logpath /var/log/mongodb.log --logappend'
      },
      monDEL: {
        options: {  stdout: true },
        command: 'mongo mule_dev --eval ' +
        '"db.gameboards.drop(); db.games.drop(); db.gamestates.drop(); db.spacestates.drop(); db.piecestates.drop(); db.turns.drop(); db.histories.drop(); db.rulebundles.drop();"'
        + ' && mongo mule_test --eval ' +
        '"db.gameboards.drop(); db.games.drop(); db.gamestates.drop(); db.spacestates.drop(); db.piecestates.drop(); db.turns.drop(); db.histories.drop(); db.rulebundles.drop();"'
      },
      monDELETE: {
        options: {  stdout: true },
        command: 'mongo mule_dev --eval "db.dropDatabase()" && mongo mule_test --eval "db.dropDatabase()"'
      },
      monCLONE: {
        options: {stdout: true},
        command: 'mongo mule_dev_copy --eval "db.dropDatabase();"; mongo --eval "db.copyDatabase(\'mule_dev\', \'mule_dev_copy\');"'
      },
      monSET: {
        options: {stdout: true},
        command: 'mongo mule_dev --eval "db.dropDatabase(); db.copyDatabase(\'mule_dev_copy\',\'mule_dev\');"'
      }
    }
  });

  grunt.registerTask('start', ['watch']);
  grunt.registerTask('test', ['simplemocha']);
  grunt.registerTask('default', ['test']);

  grunt.registerTask('updateMule', ['shell:mule_update']);
  grunt.registerTask('updateUtils', ['shell:updateUtils']);
  grunt.registerTask('gstatus', ['shell:gstatus']);
  grunt.registerTask('gs', ['shell:gstatus']);
  grunt.registerTask('style', ['shell:style']);
  grunt.registerTask('clearLogs', ['shell:clear_logs']);

  grunt.registerTask('monGO', ['shell:monGO']);
  grunt.registerTask('monDEL', ['shell:monDEL']);
  grunt.registerTask('monDELETE', ['shell:monDELETE']);
  grunt.registerTask('monCLONE', ['shell:monCLONE']);
  grunt.registerTask('monSET', ['shell:monSET']);
};
