/**
 * demoLib.js
 *
 * Created by niko on 2/5/14.
 */

define(["mule-js-sdk/sdk", 'boardRenderLibs/d3/myD3Lib', 'dumbLib'], function (sdk, myD3Lib, dumbLib) {
  var SDK = sdk('../');

  var that = {};

  var currentUserId;

  that.initPage = function () {
    //get RuleBundles
    SDK.RuleBundles.indexQ()
      .done(function(data ) {
        console.log( "ruleBundle.index: ");
        console.log(data);

        if(!_.isArray(data)){
          alert("ruleBundle.index not an Array: "+JSON.stringify(data));
          return;
        }

        //set RuleBundles to dropdown
        that.setRuleBundleDropdownOptions(data);
        that.initializeTurnProgressSettingsDiv();

        //load games
        $('#getGames').click();
        dumbLib.loadGameIdURL(function (gameId) {
          that.tryViewGame(gameId);
        });
      }).fail(function(msg){
        alert("ruleBundle.index Fail");
      });
  };

  ///////////////////// USER STUFF /////////////////////

  that.tryCreateUser = function () {
    var username = $("#usernameText").val();
    var password = $("#passwordText").val();

    SDK.Users.createQ({
      "username" : username,
      "password" : password
    })
      .done(function(data) {
        console.log( "Data Recieved: " + JSON.stringify(data) );

        if(data.status != 0){
          alert("createUser failed: "+data.statusMsg);
          return;
        }
        currentUserId = data.userId;
        that.registerSuccessAlert();
      }).fail(function(res){
        that.registerFailAlert();
        alert("createUser Fail: " + JSON.stringify(res.responseJSON.statusMsg));
      });
  };

  that.tryLogin = function () {
    var username = $("#usernameText").val();
    var password = $("#passwordText").val();

    $("#tabs-2").html("");

    return SDK.Users.loginQ({
      "username" : username,
      "password" : password
    })
      .then(function(data ) {
        console.log( "Data Recieved: " + JSON.stringify(data) );
        currentUserId = data.userId;
        that.loginSuccessAlert();
      })
      .fail(function(res){
        console.log(res);
        that.loginFailAlert();
        alert("login Fail: " +JSON.stringify(res.responseText));
      });

  };

  ///////////////////// GAME STUFF /////////////////////

  that.tryCreateGame = function () {
    var gamename = $("#startG_name").val();
    var maxPlayers = $("#startG_num").val();

    var gameConfig = {
      name: gamename,
      ruleBundle: {id: that.selectedRuleBundle._id },
      maxPlayers: maxPlayers,
      turnProgressStyle: selectedTurnProgressStyle,
      turnTimeLimit: $('#turnTimeLimit').val(),
      ruleBundleGameSettings: {
        customBoardSettings: {}
      }
    };

    _.each(that.getCurrentCustomBoardSettings() , function (value, key) {
      gameConfig.ruleBundleGameSettings.customBoardSettings[key] = parseInt($("#startG_custom_"+key).val());
    });

    SDK.Games.createQ({ gameConfig: gameConfig })
      .done(function(data) {
        console.log( "Data Received: " + JSON.stringify(data) );

        if(data.status != 0){
          alert("login failed: "+data.statusMsg);
          return;
        }

        $('#getGames').click();

        //reset create game fields
        that.generateStartGameDOM(that.selectedRuleBundle);

        that.tryViewGame(data.gameId);
      }).fail(function(res){
        alert("Fail " + res.responseText);
      });
  };

  that.tryGetGames = function () {
    SDK.Games.indexQ()
      .done(function(data ) {
        console.log( "Data Received: ");
        console.log(data);

        if(!_.isArray(data)){
          alert("Get Games failed: "+JSON.stringify(data));
          return;
        }
        var games = data;
        var gamesSize = _.size(data);

        //populating the games list tabs
        $("#tabs-1").html("");
        if(gamesSize){
          _.each(games, function(value) {
            $("#tabs-1")
              .append(that.makeGameTable(value))
              .append('<br>');
          });
        }
      }).fail(function(msg){
        alert("getGames Fail");
      });
  };

  that.tryGetMyGames = function () {
    if (!SDK.Users.getLoggedInUserId()) {
      alert('You are not logged in!')
      return;
    }

    SDK.Games.readMyGamesQ()
      .done(function(data) {
        console.log( "Data Recieved: ");
        console.log(data);

        if(!_.isArray(data)){
          alert("Get Games failed: "+JSON.stringify(data));
          return;
        }
        var games = data;
        var gamesSize = _.size(data);

        //populating the games list tabs
        $("#tabs-2").html("");
        if(gamesSize){
          _.each(games, function(value) {
            $("#tabs-2")
              .append(that.makeGameTable(value))
              .append('<br>');
          });
        }
      }).fail(function(msg){
        alert("getMyGames Fail: " + JSON.stringify(msg));
      });
  };

  // 'View Game Info'
  that.tryViewGame = function (gameId) {
    if (!gameId) {
      alert("Invalid gameId");
      return;
    }

    console.log('trying to get ' + gameId)
    SDK.Games.readQ(gameId)
      .done(function(game ){
        console.log("Data Recieved: ");
        console.log(game);

        $('#gameInfoArea').html('');

        if (game.gameStatus === 'inProgress') {
          SDK.Historys.readGamesHistoryQ(game._id)
            .then(function (history) {
              $("#gameInfoArea").append(that.makeGameInfoTable(game, history.currentRound));
            })
        } else {
          $("#gameInfoArea").append(that.makeGameInfoTable(game, 0));
        }


        that.renderGameBoard(gameId);

        dumbLib.addGameIdURL(gameId);
      });
  };

  that.tryJoinGame = function (gameId) {
    SDK.Games.joinGameQ(gameId)
      .done(function(data) {
        console.log( "Data Recieved: " + JSON.stringify(data) );

        if(data.status != 0){
          alert("join game failed: "+data.statusMsg);
          return;
        }

        alert('you joined gameId[' + data.gameId + ']')

      }).fail(function(msg){
        alert("JoinGame Fail Response:" + JSON.stringify(msg));
      });
  };


  that.viewBoard = function (gameId) {
    window.open("board.html?gameId="+gameId)
  };

  ////////////////// OTHER STUFF //////////////////////

  var getButton = function (func, parameter, buttonLabel, idHelp, disOnOff) {
    var makeCallback = function (_parameter) {
      return function () {
        func(_parameter);
      };
    };

    var buttonId = idHelp + '' + parameter;
    var newButton = $("<input type=\"button\" id=\"" + buttonId + "\" value=\"" + buttonLabel + "\" "+disOnOff+">");
    newButton.click(makeCallback(parameter));

    return newButton;
  };


  // for games list
  //change status color dependeding on open,inprogress,ended
  // return a string? of a table
  // should return an table element
  that.makeGameTable = function (gameData) {
    if(!gameData) return "null";

    var color = "#000000";
    var statusMsg = "";
    var disabled = "";
    var playDisabled = ""; //disabled if not in game
    switch(gameData.gameStatus){
      case 'open':
        color = "#00FF00";
        statusMsg = "Open";
        break;
      case 'inProgress':
        color = "#0000FF";
        statusMsg = "In Progress";
        disabled = "disabled";
        break;
      case 'finished':
        color = "#FF0000";
        statusMsg = "Ended";
        disabled = "disabled";
        break;

      default:
      //error
    }

    var playButton;
    if (gameData.gameStatus !== 'open' && (gameData.ruleBundle.name === 'TicTacToe'
      || gameData.ruleBundle.name === 'MuleSprawl' || gameData.ruleBundle.name === 'Backgammon')) {
      playButton = getButton(playGame, gameData, 'Play', '', '');
    } else {
      playButton = getButton(null,{},'NYI','','disabled');
    }

    var playersString = _.size(gameData.players) + '/' + gameData.maxPlayers;

    var tableElement = $('<div></div>')
        .append($('<table></table>')
          .attr({ cellSpacing : 2, border : 2 })
          .addClass("text")
          .append($('<tr></tr>')
            .append("<td>name: <h3>"+gameData.name+"</h3></td>")
            .append("<td>Status: <FONT COLOR=\'"+color+"\'><b>"+statusMsg+"</b></FONT><br></td>")
          )
          .append($('<tr></tr>')
            .append('<td>RuleBundle: <b>' + gameData.ruleBundle.name + '</b></td>')
            .append($('<td></td>')
              .append(getButton(that.tryJoinGame, gameData._id, "Join Game", 'join', disabled))
            )
          )
          .append($('<tr></tr>')
            .append($('<td></td>')
              .append(playButton)
            )
            .append($('<td></td>')
              .append(getButton(that.tryViewGame, gameData._id, "View Game", 'view', ''))
            )
          )
          .append($('<tr></tr>')
            .append("<td>Players: "+playersString+"</td>")
            .append($('<td></td>')
              .append(getButton(that.viewBoard, gameData._id, "Board View", 'boardView', ''))
            )
          )
        )
      ;

    return tableElement;
  };

  /////////////// for 'View Game Info' //////////////////

  that.makeGameInfoTable = function (gameInfo, roundNumber) {
    if(!gameInfo) return "null";

    var color = "#000000";
    var statusMsg = "";
    switch(gameInfo.gameStatus){
      case 'open':
        color = "#00FF00";
        statusMsg = "Open";
        break;
      case 'inProgress':
        color = "#0000FF";
        statusMsg = "In Progress";
        break;
      case 'finished':
        color = "#FF0000";
        statusMsg = "Ended";
        break;

      default:
      //error
    }

    //loop for players list
    var playerListDOM = $("<td colspan='2'></td>");

    _.each(gameInfo.players, function (value, key) { // readCacheQ
      var updateFunct = function (result) {
        console.log('read chace?')
        console.log(result)
        playerListDOM.append(key+").     " + result.username + " ["+result._id+"]  :  "+value.playerStatus+"<br>");
      };

      SDK.Users.readCacheQ(value.playerId)
        .then(updateFunct, updateFunct);
    });

    var playersString = _.size(gameInfo.players) + '/' + gameInfo.maxPlayers + ' players</td>';

    var tableElement = $('<div></div>')
        .append($('<table></table>')
          .attr({ cellSpacing : 2, border : 2 })
          .addClass("text")
          .append($('<tr></tr>')
            .append("<td>name: <h3>"+gameInfo.name+"</h3></td>")
            .append("<td>Id: "+gameInfo._id+"<br>RuleBundle: "+gameInfo.ruleBundle.name+"<br> Status: <b><FONT COLOR=\'"+color+"\'>"+statusMsg+"</FONT></b></td>")
          )
          .append($('<tr></tr>')
            .append("<td>Round: "+roundNumber+"<br>"+playersString)
            .append("<td> RuleBundle GameSettings: <br>"+JSON.stringify(gameInfo.ruleBundleGameSettings || {}) +"</td>")
          )
          .append($('<tr></tr>')
            .append("<td>TurnProgressStyle: "+gameInfo.turnProgressStyle+"<br>")
            .append("<td>TurnTimeLimit: "+gameInfo.turnTimeLimit+"<br>NextTurnTime: "+gameInfo.nextTurnTime+"</td>")
          )
          .append($('<tr></tr>')
            .append(playerListDOM)
          )
        )
      ;

    return tableElement;
  };

  ////////////// for Create Game setting fields modification ///////////////

  that.setRuleBundleDropdownOptions = function (ruleBundleObjects) {
    _.each(ruleBundleObjects, function (value, key) {
      $('#startG_ruleBundle_dropper')
        .append($('<li></li>')
          .append(getButton(that.generateStartGameDOM, value, value.name, 'dd' + key, ''))
        );
    });
  };

  that.selectedRuleBundle;

  that.generateStartGameDOM = function (ruleBundleObject) {
    that.selectedRuleBundle = ruleBundleObject;

    $('#startG_ruleBundle_dropper_label').text(ruleBundleObject.name);
    that.generateMaxPlayersDiv(ruleBundleObject.gameSettings.playerLimit);
    that.generateCustomBoardSettingsDiv(ruleBundleObject.gameSettings.customBoardSettings);
    generateTurnProgressSettingsDiv(ruleBundleObject);
  };

  that.generateMaxPlayersDiv = function (playerLimit) {
    $('#maxPlayersDiv').html('');
    if (!playerLimit) {
      console.log('invalid playerLimit')
    } else if (_.isNumber(playerLimit) && playerLimit % 1 === 0) {
      $('#maxPlayersDiv').html('Static Max Players: ');
      $('#maxPlayersDiv').append("<input id=\"startG_num\" type=\"text\" name=\"maxPlayers\" value=\"" + playerLimit + "\" disabled ><br>");
    } else if (_.isNumber(playerLimit.min) && _.isNumber(playerLimit.max)) {
      $('#maxPlayersDiv').html('Max Players (' + playerLimit.min + ' - ' + playerLimit.max + ') :');
      $('#maxPlayersDiv').append("<input id=\"startG_num\" type=\"text\" name=\"maxPlayers\"><br>");
    } else {
      console.log('wut: ' + JSON.stringify(playerLimit));
    }
  };

  var currentCustomBoardSettings = {};
  that.getCurrentCustomBoardSettings = function () { return currentCustomBoardSettings; };

  that.generateCustomBoardSettingsDiv = function (customBoardSettings) {
    $('#customBoardSettingsDiv').html('');

    currentCustomBoardSettings = customBoardSettings;
    _.each(customBoardSettings, function (value, key) {
      $('#customBoardSettingsDiv').append(key + ' - ');

      if (_.isArray(value) ) {
        //TODO dropdown?
        $('#customBoardSettingsDiv').append(JSON.stringify(value) + ': ');
      } else if (_.isNumber(value.min) && _.isNumber(value.max)) {
        $('#customBoardSettingsDiv').append('(' + value.min + ' - ' + value.max + ') :');
      } else {
        console.log('wut2: ' + JSON.stringify(value));
      }

      var inputId = 'startG_custom_' + key;
      $('#customBoardSettingsDiv').append("<input id=\"" + inputId + "\" type=\"text\" name=\"" + key + "\"><br>");
    });

  };

  that.initializeTurnProgressSettingsDiv = function () {
    $('#turnProgressSettings_dropper')
      .append($('<li></li>')
        .append(getButton(setTurnProgressStyle, 'waitprogress', 'waitprogress', 'tps', ''))
        .append(getButton(setTurnProgressStyle, 'autoprogress', 'autoprogress', 'tps', ''))
      );
  };

  var generateTurnProgressSettingsDiv = function (ruleBundleObject) {
    if (ruleBundleObject.canAutoProgress) {
      $('#turnProgressSettings_dropper_label').text('Chooser Dropdown');
      $('#turnProgressSettings_dropper_label').attr('disabled', false);
      selectedTurnProgressStyle = '';
      $('#turnTimeLimit').val('');
      $('#turnTimeLimit').attr('disabled', false);
      turnProgressLocked = false;
    } else {
      $('#turnProgressSettings_dropper_label').text('waitprogress');
      $('#turnProgressSettings_dropper_label').attr('disabled', true);
      selectedTurnProgressStyle = 'waitprogress';
      $('#turnTimeLimit').val('99999');
      $('#turnTimeLimit').attr('disabled', true);
      turnProgressLocked = true;
    }
  };

  var selectedTurnProgressStyle, turnProgressLocked = false;
  var setTurnProgressStyle = function (style) {
    if (turnProgressLocked) return;

    selectedTurnProgressStyle = style;
    $('#turnProgressSettings_dropper_label').text(style);
  };

  /////////////////////////////////////////////////////

  that.alertHelper = function (type, words) {
    var alertsDOM = $('#alerts');
    alertsDOM.html('');

    var newAlert = $('<div class="alert ' + type + ' alert-dismissable"></div>')
      .append($('<button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>'))
      .append('<strong>' + words + '</strong>');

    alertsDOM.append(newAlert);
  };

  that.loginSuccessAlert = function () {
    that.alertHelper('alert-success', 'Login Successful');
  };

  that.loginFailAlert = function () {
    that.alertHelper('alert-danger', 'Login Failed');
  };

  that.registerSuccessAlert = function () {
    that.alertHelper('alert-success', 'Register Successful');
  };

  that.registerFailAlert = function () {
    that.alertHelper('alert-danger', 'Register Failed');
  };

  that.renderGameBoard = function (gameId) {
    SDK.GameBoards.readGamesBoardQ(gameId)
      .done(function(gameBoard) {
        myD3Lib.renderSmallBoardHelper(gameBoard.ruleBundle.name, gameBoard.board);
      });
  };

  var playGame = function (gameData) {
    var currentPlayerRel;
    _.each(gameData.players, function (playerInfo, playerRel) {
      if (playerInfo.playerId === currentUserId) {
        currentPlayerRel = playerRel;
      }
    });

    if (!currentPlayerRel) {
      alert('You are not in this game!');
      return;
    }

    if (gameData.ruleBundle.name === 'TicTacToe')
      window.open("tictactoe/?gameId="+gameData._id + '&playerRel=' + currentPlayerRel);
    else if (gameData.ruleBundle.name === 'MuleSprawl')
      window.open("mulesprawl/?gameId="+gameData._id);
    else if (gameData.ruleBundle.name === 'Backgammon')
      window.open("backgammon/?gameId="+gameData._id + '&playerRel=' + currentPlayerRel);
  };

  return that;
});