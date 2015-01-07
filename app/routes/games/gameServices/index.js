/**
 * app/controllers/gameServices/index.js
 */

var gameServicesHelper = require('./helper'),
  logging = require('mule-utils').logging,
  responseUtils = require('mule-utils/responseUtils');

exports.joinGame = function(req, res){
  var gameId = req.params.id;
  logging.vog('POST /games/:id/join', gameId);

  var responseJSON = {
    status: 0,
    statusMsg: "Success"
  };

  gameServicesHelper.joinQ({gameId: gameId, joiner: req.user})
    .done(function (value) {
      responseJSON.gameId = value._id;
      return res.status(200).send(responseJSON);
    }, function (err) {
      err = err.toString();
      logging.err('join failed', gameId, err); //TODO if joinQ has a undefined error, it will not  put err as statusMsg (change winston to logger in gameServicesHelper to jog your memory)
      return responseUtils.sendForbiddenError(res, err);
    });
};
