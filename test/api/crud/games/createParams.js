/**
 * createParams
 * - @nikpoklitar
 */

exports.validCreateGamesBody = {
  gameConfig : {
    name : "niks Backgammon game",
    ruleBundle : {
      name : 'Backgammon'
    },
    //don't need max players when playing checkers

    ruleBundleGameSettings : {
      customBoardSettings : {
      }
    }
  }
};

exports.expectedCreatedGameBody = {
  name : "niks Backgammon game",
  "maxPlayers" : 2,
  "gameStatus" : 'open'
};

exports.validCreateGamesBodyWithAlteredGameStatus = {
  gameConfig : {
    name : "niks Backgammon game",
    ruleBundle : {
      name : 'Backgammon'
    },
    //don't need max players when playing checkers

    ruleBundleGameSettings : {
      customBoardSettings : {
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
        width : 15,
        height : 25
      }
    }
  }
};

exports.validCheckersGameConfig = {
  name : "niks valid checkers game :)",
  ruleBundle : {
    name : 'Checkers'
  },
  maxPlayers: 2,

  ruleBundleGameSettings : {
    customBoardSettings : {
      size : 8 //TODO size : "8"
    }
  }
};

exports.validBackgammonGameConfig = {
  name : "niks valid backgammon",
  ruleBundle : {
    name : 'Backgammon'
  },

  ruleBundleGameSettings : {
    customBoardSettings : {
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
