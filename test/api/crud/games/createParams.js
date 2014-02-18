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

    maxPlayers : 3,
    ruleBundleGameSettings : {
      customBoardSettings : {
        width : 80,
        height : 20
      }
    }
  }
};

exports.validBackgammonWithExtras = {
  name : "niks valid backgammon game w/ extras",
  ruleBundle : {
    name : 'Backgammon'
  },

  ruleBundleGameSettings : {
    customBoardSettings : {
      size : 12,
      dice: 13
    }
  }
};

exports.invalidCheckersGameConfig = {
  name : "niks invalid checkers game",
  ruleBundle : {
    name : 'Checkers'
  },
  maxPlayers: 2,

  ruleBundleGameSettings : {
    customBoardSettings : {
      size : 13
    }
  }
};

exports.invalidVikingsGameConfig = {
  name : "niks invalid vikings game",
  ruleBundle : {
    name : 'Vikings'
  },

  maxPlayers : 8,
  ruleBundleGameSettings : {
    customBoardSettings : {
    }
  }
};
