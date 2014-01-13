var fs = require('fs');
var express = require('express');
var app = express();

//change how many hello worlds appear in a actual file hello.txt
var updateHellos = function(num, callback){
  if(!num || typeof num !== 'number' || num < 1)
    return callback("invalid num");
  
  var i;
  var str = '';
  for(i=0;i<num;i++){
    str += 'Hello World\n';
  }

  fs.writeFile('hello.txt',str, function (err) {
    if (err){
      return callback(err);
    }
    callback();
  });

};

//servers the hello.txt from fs
//  callback(err,responseString)
var serveHellos = function(callback){
  fs.readFile('hello.txt', 'utf8', function(err, data){
    if(err){
      return callback(err);
    }
    callback(undefined, data);
  });
};


var updateHellos_api = function(req, res){
  var num = req.params.num || 0;
  console.log('set: num: '+num);

  updateHellos(num,function(err,responseString){
    if(err){
      if(err === "invalid num")
        res.statusCode = 400;
      res.end('set: failure: '+err);
      console.log("set: failure: "+err);
//      res.statusCode = 400;
    }else{
      res.end('set: success: '+num);   
      console.log("set: success: "+num);
    }
  });
};

var serveHellos_api = function(req, res){
  serveHellos(function(err, responseString){
    if(err){
      res.end('FAILURE');
//      res.statusCode = 400;

      console.log('get: failure: '+err);
    }else{
      res.end(responseString);
      console.log('get: success');
    }
  });
};

//just for testing
exports.serveHellos = serveHellos;
exports.updateHellos = updateHellos;

var startServer = function(){
  app.get('/hello', serveHellos_api);
  app.put('/hello/:num', updateHellos_api);
  app.listen(3000);
  console.log('Promises: Listening on port 3000');
};

fs.exists('hello.txt',function(exists){
  if(exists){
    return startServer();
  }else{
    fs.writeFile('hello.txt','DEFAULT LOLZ', function (err) {
      if(err){ 
        console.log('killing server: cant write hello.txt: '+err);
        return;
      }
      startServer();
    });
  }
});



