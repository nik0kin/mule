**(Abstract) Asyncronous Strategy (Multiplayer Game) Server**

Asyncronous Turn-based Game Platform?

Roadmap to 0.0.1 / Milestones:
- I - Users/Games
- II - Concept of RuleBundles added
- III - GameBoard (Spaces' and Pieces)
- IV - Turn System
- V - Action System Experiments (TicTacToe, MuleSprawl, Backgammon)  <--CURRENT
- VI - Huge Cleanup / Refactor Month
- VII - RuleBundle API
- VIII - Efficiency and ??? http://itch.io/jam/procjam ???
- IX - AI

Latest commit on master hosted at (CI staging):
- MuleFrontend: http://zion.tgp.io:313/
- Old/Debug: http://zion.tgp.io:3130/webservices/public/

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
    sudo npm install -g grunt-cli forever
```

MongoDB:
-----------
- http://docs.mongodb.org/manual/installation/
OR
- http://docs.mongodb.org/manual/tutorial/install-mongodb-on-linux/
- put mongo folder in '~/mongodb'
- run 'grunt monGO' to start mongodb

Install ProjectMule
-----------
```
    npm install
    grunt updateMule
```

Nginx Config
-----------

  - Ubuntu: /etc/nginx/nginx.conf

RUN:
=======

```
    npm start
```
or
```
    node server.js
```
