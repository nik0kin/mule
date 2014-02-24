**(Abstract) Asyncronous Strategy (Multiplayer Game) Server**

0.1.0 - Users/Games
0.1.5 - Refactor Week
0.1.6 - Standardized http response codes
0.1.7 - Concept of RuleBundles added
0.1.8 - GameBoard (Spaces' and Pieces) <--CURRENT
0.1.9 - Cleanup
0.2.0 - Turns and Moves / Checkers?
0.2.1 - Refactor Week

Latest commit on master hosted at (CI staging):
- http://mc.thegamingproject.org:3130/public/

INSTALL:
=======

Node (Ubuntu):
-----------
```
    sudo apt-get update
    sudo apt-get install -y python-software-properties python g++ make
    sudo add-apt-repository ppa:chris-lea/node.js
    sudo apt-get update
    sudo apt-get install nodejs
```
    
Grunt, forever:
-----------
```
    sudo install -g grunt-cli forever
```


MongoDB:
-----------
- http://docs.mongodb.org/manual/installation/
OR
- http://docs.mongodb.org/manual/tutorial/install-mongodb-on-linux/
- put mongo folder in '~/mongo-linux'
- run 'monGO' to start mongodb

Install ProjectMule
-----------
```
    npm install
```

RUN:
=======

```
    npm start
```
or
```
    node server.js
```
