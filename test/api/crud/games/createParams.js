/**
 * createParams
 * - @nikpoklitar
 */

exports.validCreateGamesBody = {
  gameConfig : {
    "name": "fun game 3v3",
    "maxPlayers" : '6',
    "width" : 40,
    "height" : '40',
    "turnStyle" : "realtime"
  }
};

exports.expectedCreatedGameBody = {
  "name": "fun game 3v3",
  "maxPlayers" : 6,
  "width" : 40,
  "height" : 40
};

exports.validCreateGamesBodyWithAlteredGameStatus = {
  gameConfig : {
    "name": "fun game 3v3",
    "maxPlayers" : '6',
    "width" : 40,
    "height" : '40',
    "turnStyle" : "realtime",
    "gameStatus" : "}{}#$%#$^sh run OMG hax"
  }
};

exports.invalidCreateGamesBody = {
  gameConfig : {
    "name": "fun game 3v3",
    "maxPlayers" : '6',
    "width" : 0,
    "height" : -1,
    "turnStyle" : "realtime"
  }
};
exports.invalidCreateGamesBody2 = {
  gameConfig : {
    "name": "fun game 3v3",
    "maxPlayers" : '6',
    "width" : 50000,
    "height" : 501,
    "turnStyle" : "realtime"
  }
};
exports.invalidCreateGamesBody3 = {
  gameConfig : {
    "name": "fun game 3v3",
    "maxPlayers" : '11',
    "width" : 5,
    "height" : 5,
    "turnStyle" : "realtime"
  }
};
exports.invalidCreateGamesBody4 = {
  gameConfig : {
    "name": "fun game 3v3",
    "maxPlayers" : '1',
    "width" : 5,
    "height" : 5,
    "turnStyle" : "realtime"
  }
};
exports.invalidZerosGameConfig = {"name":"","maxPlayers":0,"width":0,"height":0};
