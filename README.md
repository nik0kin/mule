Mule
=======
**Turn-Based Game Platform featuring Asyncronous Multiplayer Gameplay**

Roadmap to 0.0.1 / Milestones:
- I - Users/Games
- II - Concept of RuleBundles added
- III - GameBoard (Spaces' and Pieces)
- IV - Turn System
- V - Action System Experiments (TicTacToe, MuleSprawl, Backgammon)  <--CURRENT
- VI - Huge Cleanup / Refactor Month
- VII - RuleBundle API
- VIII - Efficiency
- IX - AI

Latest commit on master hosted at (CI staging):
- MuleFrontend: http://zion.tgp.io:313/
- Old/Debug: http://zion.tgp.io:313/webservices/public/

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
    sudo npm install -g grunt-cli pm2
```

Dev Tools:
-----------
```
    sudo npm install -g node-inspector mocha jscs jshint
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
To run as a background process using pm2 (```sudo npm install pm2 -g```)
```
    npm start
```
or
```
    node server.js
```

TESTS:
=======
```
npm test
```
