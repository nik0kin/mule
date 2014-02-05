var token = "";

function tryJoinGame(gameID){
  $.ajax({
    type: "POST",
    url: contextPath+"games/" + gameID + '/join',
    data: {
    }
  }).done(function(data) {

      console.log( "Data Recieved: " + JSON.stringify(data) );

      if(data.status != 0){
        alert("join game failed: "+data.statusMsg);
        return;
      }

      alert('you joined gameID[' + data.gameID + ']')

    }).fail(function(msg){
      alert("JoinGame Fail Response:" + JSON.stringify(msg));
    });
}

function tryGetGameInfo(token,gameID){

}

function tryGetTurnInfo(token,gameID,turn){

}

function playGame(gameID){
  window.open("play.html?token="+token+"&gameID="+gameID)
}


//change status color dependeding on open,inprogress,ended
function getGameTable(gameData){
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
  }else{
    joinedMsg = "";
    playDisabled = "disabled";
  }

  var getButton = function (func, parameter, buttonLabel) {
    var funcString = func + "('"+parameter+"');";
    var stringS =  "<td><input type=\"button\" onclick=\"" + funcString + "\" value=\"" + buttonLabel + "\" "+disabled+"></td>";
    return stringS;
  };

  var string = "<table border=\'1\'>";
  string += "<tr>";
  string += "<td>name: <h3>"+gameData.name+"</h3></td>";
  string += "<td>Status: <FONT COLOR=\'"+color+"\'><b>"+statusMsg+"</b></FONT><br>";
  string += joinedMsg+"</td>";
  string += "</tr>";
  string += "<tr>";
  string += "<td>Turn: "+gameData.turnNumber+"</td>";
  string += getButton("tryJoinGame", gameData._id, "Join Game");
  string += "</tr>";
  string += "<tr>";
  string += "<td>Players: "+gameData.numberOfPlayers+"</td>";
  string += getButton("selectGame", gameData._id, "View Game");
  string += "</tr>";
  string += "<tr>";
  string += "<td></td>";
  string += getButton("playGame", gameData._id, "Play Game");
  string += "</tr>";
  string += "</table>";

  return string;
}
function getGameInfoTable(gameInfo){
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

  var string = "<table border=\'1\'>";
  string += "<tr>";
  string += "<td>name: <h3>"+gameInfo.name+"</h3></td>";
  string += "<td>ID: "+gameInfo._id+"<br><FONT COLOR=\'"+color+"\'>"+statusMsg+"</FONT></td>";
  string += "</tr>";
  string += "<tr>";
  string += "<td>Turn: "+gameInfo.turnNumber+"<br>"+gameInfo.numberOfPlayers+" players</td>";
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
}