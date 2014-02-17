/**
 * demoLib.js
 *
 * Created by niko on 2/5/14.
 */

define(["mule-js-sdk/sdk"], function (sdk) {
  var SDK = sdk('../');

  var that = {};

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
      }).fail(function(res){
        alert("createUser Fail: " + JSON.stringify(res.responseJSON.statusMsg));
      });
  };

  that.tryLogin = function () {
    var username = $("#usernameText").val();
    var password = $("#passwordText").val();

    SDK.Users.loginQ({
      "username" : username,
      "password" : password
    })
      .done(function(data ) {
        console.log( "Data Recieved: " + JSON.stringify(data) );
      }).fail(function(res){
        console.log(res);
        alert("login Fail: " +res.responseText);
      });

    $("#tabs-1").html("");
    $("#tabs-2").html("");
  };

  ///////////////////// GAME STUFF /////////////////////

  that.tryCreateGame = function () {
    var gamename = $("#startG_name").val();
    var maxPlayers = $("#startG_num").val();
    var width = $("#startG_width").val();
    var height = $("#startG_height").val();

    var gameConfig = {
      name: gamename,
      ruleBundle: {id: that.selectedRuleBundle },
      maxPlayers: maxPlayers,
      customBoardSettings: {}
    };

    SDK.Games.createQ({ gameConfig: gameConfig })
      .done(function(data) {
        console.log( "Data Recieved: " + JSON.stringify(data) );

        if(data.status != 0){
          alert("login failed: "+data.statusMsg);
          return;
        }

      }).fail(function(res){
        alert("Fail " + res.responseText);
      });
  };

  that.tryGetGames = function () {
    SDK.Games.indexQ()
      .done(function(data ) {
        console.log( "Data Recieved: ");
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

  that.tryViewGame = function (gameID) {
    if (!gameID) {
      alert("Invalid gameID");
      return;
    }

    console.log('trying to get ' + gameID)
    SDK.Games.readQ(gameID)
      .done(function(data ){
        console.log("Data Recieved: ");
        console.log(data);

        $('#gameInfoArea').html('');
        $("#gameInfoArea").append(that.makeGameInfoTable(data));
      });
  };

  that.tryJoinGame = function (gameID) {
    SDK.Games.joinGameQ(gameID)
    .done(function(data) {
        console.log( "Data Recieved: " + JSON.stringify(data) );

        if(data.status != 0){
          alert("join game failed: "+data.statusMsg);
          return;
        }

        alert('you joined gameID[' + data.gameID + ']')

      }).fail(function(msg){
        alert("JoinGame Fail Response:" + JSON.stringify(msg));
      });
  };


  that.playGame = function (gameID) {
    window.open("play.html?token="+token+"&gameID="+gameID)
  };

  ////////////////// OTHER STUFF //////////////////////

  var getButton = function (func, parameter, buttonLabel, idHelp, disOnOff) {
    var makeCallback = function (_parameter) {
      return function () {
        func(_parameter);
      };
    };

    var buttonID = idHelp + '' + parameter;
    var newButton = $("<input type=\"button\" id=\"" + buttonID + "\" value=\"" + buttonLabel + "\" "+disOnOff+">");
    newButton.click(makeCallback(parameter));

    return newButton;
  };

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

    var joinedMsg;
    if(gameData.joined != undefined && (gameData.joined == true || gameData.joined == "true")){
      joinedMsg = "<b>Joined</b>";
      disabled = "disabled";
    } else {
      joinedMsg = "";
      playDisabled = "disabled";
    }

    var tableElement = $('<div></div>')
        .append($('<table></table>')
          .attr({ cellSpacing : 2, border : 2 })
          .addClass("text")
          .append($('<tr></tr>')
            .append("<td>name: <h3>"+gameData.name+"</h3></td>")
            .append("<td>Status: <FONT COLOR=\'"+color+"\'><b>"+statusMsg+"</b></FONT><br>" + joinedMsg+"</td>")
          )
          .append($('<tr></tr>')
            .append("<td>Turn: "+gameData.turnNumber+"</td>")
            .append($('<td></td>')
              .append(getButton(that.tryJoinGame, gameData._id, "Join Game", 'join', disabled))
            )
          )
          .append($('<tr></tr>')
            .append("<td>Players: "+gameData.maxPlayers+"</td>")
            .append($('<td></td>')
              .append(getButton(that.tryViewGame, gameData._id, "View Game", 'view', ''))
            )
          )
          .append($('<tr></tr>')
            .append('<td></td>')
            .append($('<td></td>')
              .append(getButton(that.playGame, gameData._id, "Play Game", 'play', 'disabled'))
            )
          )
        )
      ;

    return tableElement;
  };

  that.makeGameInfoTable = function (gameInfo) {
    if(!gameInfo) return "null";

    var color = "#000000";
    var statusMsg = "";
    switch(gameInfo.gameStatus){
      case 0:
        color = "#00FF00";
        statusMsg = "Open";
        break;
      case 1:
        color = "#0000FF";
        statusMsg = "In Progress";
        break;
      case 2:
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

      SDK.Users.readCacheQ(value.playerID)
        .then(updateFunct, updateFunct);
    });

    var tableElement = $('<div></div>')
        .append($('<table></table>')
          .attr({ cellSpacing : 2, border : 2 })
          .addClass("text")
          .append($('<tr></tr>')
            .append("<td>name: <h3>"+gameInfo.name+"</h3></td>")
            .append("<td>ID: "+gameInfo._id+"<br><FONT COLOR=\'"+color+"\'>"+statusMsg+"</FONT></td>")
          )
          .append($('<tr></tr>')
            .append("<td>Turn: "+gameInfo.turnNumber+"<br>"+gameInfo.maxPlayers+" players</td>")
            .append("<td> "+JSON.stringify(gameInfo.ruleBundleGameSettings) +"</td>")
          )
          .append($('<tr></tr>')
            .append(playerListDOM)
          )
        )
      ;

    return tableElement;
  };

  that.initRuleBundleDropdown = function () {
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
      }).fail(function(msg){
        alert("ruleBundle.index Fail");
      });

  };

  that.setRuleBundleDropdownOptions = function (object) {
    _.each(object, function (value, key) {
      $('#startG_ruleBundle_dropper')
        .append($('<li></li>')
          .append(getButton(that.generateStartGameDOM, value, value.name, 'dd' + key, ''))
        );
    });
  };

  that.selectedRuleBundle = '';

  that.generateStartGameDOM = function (ruleBundleObject) {
    that.selectedRuleBundle = ruleBundleObject._id;

    $('#startG_ruleBundle_dropper_label').text(ruleBundleObject.name);
    that.generateMaxPlayersDiv(ruleBundleObject.gameSettings.playerLimit);
    that.generateCustomBoardSettingsDiv(ruleBundleObject.gameSettings.customBoardSettings);
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

  that.generateCustomBoardSettingsDiv = function (playerLimit) {
    $('#customBoardSettingsDiv').html('');
    /*if (!playerLimit) {
      console.log('invalid playerLimit')
    } else if (_.isNumber(playerLimit) && playerLimit % 1 === 0) {
      $('#maxPlayersDiv').html('Static Max Players: ');
      $('#maxPlayersDiv').append("<input id=\"startG_num\" type=\"text\" name=\"maxPlayers\" value=\"" + playerLimit + "\" disabled ><br>");
    } else if (_.isNumber(playerLimit.min) && _.isNumber(playerLimit.max)) {
      $('#maxPlayersDiv').html('Max Players (' + playerLimit.min + ' - ' + playerLimit.max + ') :');
      $('#maxPlayersDiv').append("<input id=\"startG_num\" type=\"text\" name=\"maxPlayers\"><br>");
    } else {
      console.log('wut: ' + JSON.stringify(playerLimit));
    }*/
  };

  return that;
});