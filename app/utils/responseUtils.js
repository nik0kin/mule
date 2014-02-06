/**
 * responseUtils
 * - @nikpoklitar
 */

var winston = require('winston');

exports.getNewResponseJSON = function () {
  return {
    status : 0,
    statusMsg : "Default Success"
  };
};
//TODO refactor these mofos
exports.sendBadRequestCallback = function (res) {
  return function (_err) {
    winston.error(_err);

    res.status(400).send({
      status: -1,
      statusMsg: _err
    });
  }
};

exports.sendForbiddenError = function (res, err) {
  var response = exports.getNewResponseJSON();
  response.status = -1;
  response.statusMsg = err;
  return res.status(403).send(response);
};

exports.sendNotFoundErrorCallback = function (res) {
  return function (err) {
    return res.status(404).send(err);
  };
};

exports.sendNotAcceptableErrorCallback = function (res) {
  return function (err) {
    return res.status(406).send({
      status: -1,
      statusMsg: err
    });
  };
};


///////// SERVER ERRORS /////////////

exports.sendInternalServerError = function (res, err) {
  var response = exports.getNewResponseJSON();
  response.status = -1;
  response.statusMsg = err;
  return res.status(500).send(response);
};

exports.sendInternalServerErrorCallback = function (res) {
  return function (err) {
    winston.error('error...(sendInternalServerErrorCallback)', err);
    return exports.sendInternalServerError(res, err);
  };
};

exports.sendNotYetImplemented = function (res, msg) {
  var response = exports.getNewResponseJSON();
  response.status = -1;
  response.statusMsg = msg;
  return res.status(501).send(response);
};