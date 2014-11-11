/**
 * app/controllers/gameServices/index.js
 *
 * Created by niko on 2/3/14.
 */

var winston = require('winston');

var gameServicesHelper = require('./helper'),
  responseUtils = require('mule-utils/responseUtils');

exports.joinGame = function(req, res){
  winston.info('POST /games/:id/join', req.params.id);

  var responseJSON = {
    status: 0,
    statusMsg: "Success"
  };

  gameServicesHelper.joinQ({gameID : req.params.id, joiner : req.user})
    .done(function (value) {
      responseJSON.gameID = value._id;
      return res.status(200).send(responseJSON);
    }, function (err) {
      err = err.toString();
      winston.log('info', 'join failed', err); //TODO if joinQ has a undefined error, it will not  put err as statusMsg (change winston to logger in gameServicesHelper to jog your memory)
      return responseUtils.sendForbiddenError(res, err);
    });
};