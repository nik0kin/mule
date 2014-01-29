/**
 * gameStatusUtils
 *
 * Created by niko on 1/28/14.
 */

exports.validateGameStatus = function (gameStatus) {
  switch (gameStatus){
    case 'open' :
    case 'inProgress' :
    case 'finished' :
      return true;
    default:
      return false;
  }
}