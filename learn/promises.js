var fs = require('fs');
var express = require('express');
var app = express();

//change how many hello worlds appear in a actual file hello.txt
app.put('/hello/:num', function(req, res){
  var num = req.params.num;
  console.log('set: num: '+num);

  var i;
  var str = '';
  for(i=0;i<num;i++){
    str += 'Hello World\n';
  }

  fs.writeFile('hello.txt',str, function (err) {
    if (err){
    // throw err;
      res.end('set: failure: '+err);
      return;
    }
    res.end('set: success: '+num);
  });
});


//servers the hello.txt from fs
app.get('/hello', function(req, res){

  fs.readFile('hello.txt', 'utf8', function(err, data){
    if(err){
      console.log('get: failure');
      res.end('get: failure: '+err);
      return;
    }
    console.log('get: success');
    res.end(data);

  });
});


app.listen(3000);
console.log('Listening on port 3000');
