/**
 * Created by niko on 1/28/14.
 */

var dbHelper = require('./dbHelper');

describe('dbHelper: ', function () {
  it('addUserQ should work', function (done){
    dbHelper.addUserQ({username : "joe", password : "blow"})
      .done(function (user) {
        ourPlayerID = user._id;
        done()
      }, function (err) {
        done(err);
      });
  });

  it('addGameQ should work', function (done){
    var validCreateGamesBody = {
      "name": "fun game 3v3",
      "numberOfPlayers" : 6,
      "width" : 40,
      "height" : 40,
      "fog" : 'false',
      "turnStyle" : "realtime"
    };
    dbHelper.addGameQ(validCreateGamesBody)
      .done(function (user) {
        ourPlayerID = user._id;
        done()
      }, function (err) {
        done(err);
      });
  });
});
