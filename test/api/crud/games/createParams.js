/**
 * createParams
 * - @nikpoklitar
 */

exports.validCreateGamesBody = {
  gameConfig : {
    name : "niks checkers game",
    ruleBundle : {
      name : 'Checkers'
    },
    //don't need max players when playing checkers

    ruleBundleGameSettings : {
      customBoardSettings : {
        size : 8
      }
    }
  }
};

exports.expectedCreatedGameBody = {
  name : "niks checkers game",
  "maxPlayers" : 2,
  "gameStatus" : 'open'
};

exports.validCreateGamesBodyWithAlteredGameStatus = {
  gameConfig : {
    name : "niks checkers game",
    ruleBundle : {
      name : 'Checkers'
    },
    //don't need max players when playing checkers

    ruleBundleGameSettings : {
      customBoardSettings : {
        size : 8
      }
    },
    "gameStatus" : "}{}#$%#$^sh run OMG hax"
  }
};

exports.invalidZerosGameConfig = {"name":"","maxPlayers":0,"width":0,"height":0};

exports.validVikingGameConfigBody = {
  gameConfig : {
    name : "niks vikings game",
    ruleBundle : {
      name : 'Vikings'
    },
    //don't need max players when playing checkers

    maxPlayers : 3,
    ruleBundleGameSettings : {
      customBoardSettings : {
        width : 80,
        height : 20
      }
    }
  }
};
