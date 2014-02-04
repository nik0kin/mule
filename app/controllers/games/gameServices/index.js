/**
 * app/controllers/gameServices/index.js
 *
 * Created by niko on 2/3/14.
 */


exports.joinGame = function(req, res){
  res.status(200).send({'joinedGame: ' : req.params.gameID});
};