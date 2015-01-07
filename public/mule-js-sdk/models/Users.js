/**
 * js-sdk/models/Users.js
 *
 * Created by niko on 2/5/14.
 */

define(['../q'], function (Q) {
  var userId;

  return function (contextPath) {
    var that = {};

    that.getLoggedInUserId = function () {
      return userId;
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
          userId = result.userId;
          that.fakeCacheWrite({_id: result.userId, username: params.username});
          return result;
        });
    };

    that.readQ = function (userId) {
      return $.ajax({
        type: "GET",
        url: contextPath+"users/" + userId
      });
    };

    ////// USER SERVICES //////
    that.sessionQ = function () {
      return $.get(contextPath + 'session');
    };

    that.loginQ = function (params) {
      return $.ajax({
        type: "POST",
        url: contextPath+"LoginAuth",
        data: params
      })
        .then(function (result) {
          userId = result.userId;
          that.fakeCacheWrite({_id: result.userId, username: params.username});
          return result;
        });
    };

    ////// CACHING //////
    that.usersCache = {};

    that.fakeCacheWrite = function (result) {
      that.usersCache[result._id] = result;
    };

    that.readCacheQ = function lol1(userId) {
      return Q.promise(function (resolve, reject) {
        if (that.usersCache[userId]) {
          resolve(that.usersCache[userId]);
        } else {
          that.readQ(userId)
            .then(function (result) {
                that.usersCache[result._id] = result;
                resolve(result);
            });
        }
      });
    };

    that.indexCacheQ = function (force) {
      return Q.promise(function (resolve, reject) {
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