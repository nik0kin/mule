var mongoose = require('mongoose'),
    async = require('async'),
    User = mongoose.model('User');

/**
 * Clear database
 *
 * @param {Function} done
 * @api public
 */

exports.clearDb = function (done) {
 /* async.parallel([
    function (cb) {
      User.collection.remove(cb);
      console.log('user collection removed');
    }
  ], function(){
    console.log(mongoose.connect);
    if(mongoose.connect.close){
      console.log('going to close connections');
      mongoose.connect.close(function(){
        console.log('connection closed');
        done();
      });
    }else{
      console.log('mongoose.connect wasnt a function');
      done();
    }
  });
*/
  mongoose.connection.close(function(){
    done();
  });
};

exports.mochaError = function (done) {
  return function (err) { done(err); }
};