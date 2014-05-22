var _ = require('lodash'),
  Q = require('q');

var Actions = {
  BasicCreate: require('./tempActions/basicCreate'),
  BasicMove: require('./tempActions/basicMove')
};



exports.validateActionsQ = function (gameBoardId, actions) {
  var promiseArray = [];
  _.each(actions, function (action, key) {
    var Action = Actions[action.type];
    if (!Action) {
      //TODO correct error handling
      console.log('wow that action doesnt exist')
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

// Todo refactor into a smarter place?
exports.searchThruSpacesForId = function (spaces, spaceId) {
  var found = false;
  _.each(spaces, function (value, key) {
    if (value.boardSpaceId === spaceId) {
      found = value;
    }
  });
  return found;
};

exports.searchThruPiecesForId = function (pieces, pieceId) {
  if (typeof pieceId === 'string') {
    pieceId = parseInt(pieceId);
  }
  var found = false;
  _.each(pieces, function (value, key) {
    if (value.id === pieceId) {
      found = value;
    }
  });
  return found;
};
