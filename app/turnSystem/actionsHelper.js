var _ = require('lodash'),
  Q = require('q');

var muleRules = require('mule-rules'),
  GameBoard = require('mule-models').GameBoard.Model,
  PieceState = require('mule-models').PieceState.Model;

var Actions = {
  BasicCreate: require('./tempActions/basicCreate'),
  BasicMove: require('./tempActions/basicMove')
};

exports.initActions = function (ruleBundle) {
  console.log('init');
  _.each(muleRules.getActions(ruleBundle.name), function (value) {
    value.init({GameBoard: GameBoard, PieceState: PieceState});
  });
};

var getAction = function (actionType, ruleBundle) {
  return Actions[actionType] || muleRules.getActions(ruleBundle.name)[actionType];
};


exports.validateActionsQ = function (gameBoardId, actions, ruleBundle) {
  exports.initActions(ruleBundle);

  var promiseArray = [];
  _.each(actions, function (action, key) {
    var Action = getAction(action.type, ruleBundle);
    if (!Action) {
      //TODO correct error handling
      console.log('wow that action doesnt exist')
    }

    var promise = Action.validateQ(gameBoardId, action.params, ruleBundle)
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

exports.doActionsQ = function (objs, actions, playerRel, ruleBundle) {
  var promiseArray = [];

  _.each(actions, function (action, key) {
    var Action = getAction(action.type, ruleBundle);
    var promise = Action.doQ(objs.gameBoard, action.params)
      .then(function (result) {
        console.log('R' + objs.history.currentRound + ' - ' + playerRel + ': success action #' + key);

        if (result)
          return objs.history.saveMetaDataToActionQ(result, playerRel, key);
      })
      .fail(function (err) {
        console.log('R' + objs.history.currentRound + ' - ' + playerRel + ': error action #' + key);
        console.log(err);
      });
    promiseArray.push(promise);
  });

  return Q.all(promiseArray);
};
