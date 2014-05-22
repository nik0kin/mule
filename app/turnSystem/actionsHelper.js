var _ = require('lodash'),
  Q = require('q');

var Actions = {
  BasicMove: require('./tempActions/basicMove')
};



exports.validateActionsQ = function (gameBoardId, actions) {
  var promiseArray = [];
  _.each(actions, function (action, key) {
    var Action = Actions[action.type];
    if (!Action) {
      //TODO
    }

    var promise = Action.validateQ(gameBoardId, action.params)
      .then(function (gameBoard) {
        console.log('valid move action ' + key + ': ');
        console.log(action.params);
      })
      .fail(function (err) {
        console.log('invalid action: ' + key);
        throw 'action ' + key + ': ' + err;
      });

    promiseArray.push(promise);
  });

  return Q.all(promiseArray);
};

exports.doActionsQ = function (objs, actions, playerRel) {
  var promiseArray = [];

  _.each(actions, function (action, key) {
    var Action = Actions[action.type];
    var promise = Action.doQ(objs.gameBoard, action.params)
      .then(function () {
        console.log('R' + objs.history.currentRound + ' - ' + playerRel + ': success action #' + key);
      })
      .fail(function (err) {
        console.log('R' + objs.history.currentRound + ' - ' + playerRel + ': error action #' + key);
        console.log(err);
      });
    promiseArray.push(promise);
  });

  return Q.all(promiseArray);
};