/**
 * js-sdk/models/Users.js
 *
 * Created by niko on 2/5/14.
 */

define(['../q'], function (Q) {
  var userID;

  return function (contextPath) {
    var that = {};

    that.getLoggedInUserID = function () {
      return userID;
    };

    that.indexQ = function () {
      return $.ajax({
        type: "GET",
        url: contextPath+"users"
      });
    };

    that.createQ = function (params) {
      return $.ajax({
        type: "POST",
        url: contextPath+"users",
        data: params
      })
        .then(function (result) {
          userID = result.userID;
          that.fakeCacheWrite({_id: result.userID, username: params.username});
          return result;
        });
    };

    that.readQ = function (userID) {
      return $.ajax({
        type: "GET",
        url: contextPath+"users/" + userID
      });
    };

    ////// USER SERVICES //////

    that.loginQ = function (params) {
      return $.ajax({
        type: "POST",
        url: contextPath+"LoginAuth",
        data: params
      })
        .then(function (result) {
          userID = result.userID;
          that.fakeCacheWrite({_id: result.userID, username: params.username});
          return result;
        });
    };

    ////// CACHING //////
    that.usersCache = {};

    that.fakeCacheWrite = function (result) {
      that.usersCache[result._id] = result;
    };

    that.readCacheQ = function lol1(userID) {
      return Q.promise(function lol4(reject, resolve) {
        if (that.usersCache[userID]) {
          resolve(that.usersCache[userID]);
        } else {
          that.readQ(userID)
            .done(function lol2(result) {
                that.usersCache[result._id] = result;
                resolve(result);
            }, function (err) {
              console.log('WTF')
              resolve(err)
            });
        }
      });
    };

    that.indexCacheQ = function (force) {
      return Q.promise(function (reject, resolve) {
        if (!force && _.isEmpty(that.usersCache)) {
          that.indexQ()
            .then(function (result) {
              _.each(result, function (value, key) {
                that.usersCache[value._id] = value;
              });
              resolve(result);
            });
        } else {
          resolve(that.usersCache);
        }
      });
    };

    return that;
  };
});