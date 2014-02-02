/**
 * joinGameSpec.js
 *   @nikpoklitar
 */

var dbHelper = require('../../dbHelper');

describe('API: ', function () {
  describe('Game Services: ', function () {


    after(function (done) { dbHelper.clearUsersAndGamesCollection(done); });

    describe('Join Game: ', function () {
      before(function () {
        //create a user
      });

      it('should return json' , function () {

      });

      it('basic should work' , function () {

      });


      describe('reject if' , function () {
        it('should reject an invalid gameID' , function () {

        });
        it('should reject if you are in the game' , function () {

        });
        it('should return if its full' , function () {

        });
        it('should return if its not a joinable game (inProgress or finished)' , function () {

        });
      });

    });

  });
});