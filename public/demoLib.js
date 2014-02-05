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

    var gameConfig = {name: gamename, maxPlayers: maxPlayers, width: width, height: height};

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

  var field;
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

        /*if(data.width <= 0 || data.height <= 0){
         alert("Invalid Map Width/Height");
         return;
         }*/

        $("#gameInfoArea").html(that.getGameInfoTable(data));

        /*if(field)
         field.kill();

         field = new Field(data.width,data.height,data.map);*/
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

    var getButton = function (func, parameter, buttonLabel, idHelp) {
      var makeCallback = function (_parameter) {
        return function () {
          func(_parameter);
        };
      };

      var buttonID = idHelp + '' + parameter;
      var newButton = $("<input type=\"button\" id=\"" + buttonID + "\" value=\"" + buttonLabel + "\" "+disabled+">");
      newButton.click(makeCallback(parameter));

      return newButton;
    };

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
              .append(getButton(that.tryJoinGame, gameData._id, "Join Game", 'join'))
            )
          )
          .append($('<tr></tr>')
            .append("<td>Players: "+gameData.maxPlayers+"</td>")
            .append($('<td></td>')
              .append(getButton(that.tryViewGame, gameData._id, "View Game", 'view'))
            )
          )
          .append($('<tr></tr>')
            .append('<td></td>')
            .append($('<td></td>')
              .append(getButton(that.playGame, gameData._id, "Play Game", 'play'))
            )
          )
        )
      ;

    return tableElement;
  };

  that.getGameInfoTable = function (gameInfo) {
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

    var string = "<table border=\'1\'>"; //TODO refactor into jquery
    string += "<tr>";
    string += "<td>name: <h3>"+gameInfo.name+"</h3></td>";
    string += "<td>ID: "+gameInfo._id+"<br><FONT COLOR=\'"+color+"\'>"+statusMsg+"</FONT></td>";
    string += "</tr>";
    string += "<tr>";
    string += "<td>Turn: "+gameInfo.turnNumber+"<br>"+gameInfo.maxPlayers+" players</td>";
    string += "<td> "+gameInfo.width+"x"+gameInfo.height+" map</td>";
    string += "</tr>";
    string += "<tr>";
    string += "<td colspan='2'>";
    string += "<b>Players:</b><br>";

    _.each(gameInfo.players, function (value, key) {
      string += key+").      ["+value.playerID+"]  :  "+value.playerStatus+"<br>";
    });

    string += "</td>";
    string += "</tr>";
    string += "</table>";

    return string;
  };

  return that;
});