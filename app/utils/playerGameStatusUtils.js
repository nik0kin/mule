/**
 * playerStatusUtils.js
 *
 * Created by niko on 1/28/14.
 */

exports.validatePlayerStatus = function (playerStatus) {
  switch (playerStatus){
    case 'inGame' :
    case 'kicked' :
    case 'surrendered' :
      return true;
    default:
      return false;
  }
};
