**(Abstract) Asyncronous Strategy (Multiplayer Game) Server**

Asyncronous Turn-based Game Platform?

Roadmap / Milestones:
- 0.0.1 - Users/Games
- 0.0.5 - Refactor Week
- 0.0.6 - Standardized http response codes
- 0.0.7 - Concept of RuleBundles added
- 0.0.8 - GameBoard (Spaces' and Pieces)
- 0.0.9 - Turn System / TicTacToe  <--CURRENT
- 0.0.10 - Huge Cleanup / Refactor Week
- 0.0.11 - Action System / Checkers?

Latest commit on master hosted at (CI staging):
- http://zion.tgp.io:3130/public/

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
- run 'grunt monGO' to start mongodb

Install ProjectMule
-----------
```
    npm install
    grunt updateMule
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
