/*
  References:
    - https://github.com/LearnBoost/mongoose/blob/master/examples/schema/schema.js
    - http://dailyjs.com/2011/02/07/node-tutorial-12/
    - http://mongoosejs.com/docs/guide.html

*/

var mongoose = require('mongoose'),
    crypto = require('crypto');


var UserSchema = new mongoose.Schema({
  username: {
    type: String, 
    validate: [validatePresenceOf, "an username is required"],
    index: true
  },
  hashed_password: { type: String, default: '' },
  salt: { type: String, default: '' },
  authToken: { type: String, default: '' },       //is this used?
  realname: {first: String, last: String}
//  profilePicture: "NYI",
//  friends: [UserSchema]
});

/**
 * Virtuals
 */

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() { return this._password })

/**
 * Validations
 */

function validatePresenceOf(value){
  if( value && value.length)
    return true;
  else
    return false;
}

UserSchema.path('username').validate(function (_username) {
  return _username && _username.length
}, 'username cannot be blank')

UserSchema.path('hashed_password').validate(function (hashed_password) {
  return hashed_password.length
}, 'Password cannot be blank')

/**
 * Methods
 */

UserSchema.methods = {

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */

  authenticate: function (plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */

  makeSalt: function () {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */

  encryptPassword: function (password) {
    if (!password) return ''
    var encrypred
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
      return encrypred
    } catch (err) {
      return ''
    }
  }
}

module.exports = mongoose.model('User', UserSchema);
