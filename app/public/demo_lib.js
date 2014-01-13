var token = "";

function tryJoinGame(gameID){
  $.ajax({
    type: "POST",
    url: contextPath+"JoinGame",
    data: {
      token: token,
      gameID: gameID
      //no spot(first available)
    }
  }).done(function(data) {

      console.log( "Data Recieved: " + data );

      data = JSON.parse(data);

      if(data.status != 0){
        alert("login failed: "+data.statusMsg);
        return;
      }




    }).fail(function(msg){
      alert("JoinGame Fail Response");
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
  switch(gameData.status){
    case 0:
      color = "#00FF00";
      statusMsg = "Open";
      break;
    case 1:
      color = "#0000FF";
      statusMsg = "In Progress";
      disabled = "disabled";
      break;
    case 2:
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

  var string = "<table border=\'1\'>";
  string += "<tr>";
  string += "<td>name: <h3>"+gameData.name+"</h3></td>";
  string += "<td>Status: <FONT COLOR=\'"+color+"\'><b>"+statusMsg+"</b></FONT><br>";
  string += joinedMsg+"</td>";
  string += "</tr>";
  string += "<tr>";
  string += "<td>Turn: "+gameData.turn+"</td>";
  string += "<td><input type=\'button\' onclick=\'tryJoinGame("+gameData.id+");\' value=\'Join Game\' "+disabled+"></td>";
  string += "</tr>";
  string += "<tr>";
  string += "<td>Players: "+gameData.numofplayers+"</td>";
  string += "<td><input type=\'button\' onclick=\'selectGame("+gameData.id+");\' value=\'View Game\'></td>";
  string += "</tr>";
  string += "<tr>";
  string += "<td></td>";
  string += "<td><input type=\'button\' onclick=\'playGame("+gameData.id+");\'' value=\'Play Game\' "+playDisabled+"></td>";
  string += "</tr>";
  string += "</table>";

  return string;
}
function getGameInfoTable(gameInfo){
  if(!gameInfo) return "null";

  var color = "#000000";
  var statusMsg = "";
  switch(gameInfo.gamestatus){
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
  string += "<td>ID: "+gameInfo.gameID+"<br><FONT COLOR=\'"+color+"\'>"+statusMsg+"</FONT></td>";
  string += "</tr>";
  string += "<tr>";
  string += "<td>Turn: "+gameInfo.turn+"<br>"+gameInfo.numofplayers+" players</td>";
  string += "<td> "+gameInfo.width+"x"+gameInfo.height+" map</td>";
  string += "</tr>";
  string += "<tr>";
  string += "<td colspan='2'>";
  string += "<b>Players:</b><br>";

  for(var d in gameInfo.players){
    var p = gameInfo.players[d];
    string += d+").      "+p.username+"["+p.playerID+"]  :  "+p.playerStatus+"<br>";
  }

  string += "</td>";
  string += "</tr>";
  string += "</table>";

  return string;
}