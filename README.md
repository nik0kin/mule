**(Abstract) Asyncronous Strategy (Multiplayer Game) Server**

Asyncronous Turn-based Game Platform?

Roadmap to 0.0.1 / Milestones:
- I - Users/Games
- II - Concept of RuleBundles added
- III - GameBoard (Spaces' and Pieces)
- IV - Turn System
- V - Action System Experiments (TicTacToe, MuleSprawl, Backgammon)  <--CURRENT
- VI - Huge Cleanup / Refactor Week

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
