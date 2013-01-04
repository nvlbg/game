General
=======

This is a fast game using melonJS as engine. It is supposed to be a massive multiplayer but it is currently in development.


Server requirements
-------------------
You will need Node.js and NPM installed in order to run the server. Download (or clone) Node.js at http://nodejs.org/

Quick start
-----------
In order to download the dependencies, you need to type:

`$ npm install`

Now you should be able to run the server:

`$ node server.js`

In your console you will see the address where you can access the game from.

Configuration
-------------
You can configure your game server by modifying server/config.js
Here is what each option does:

- MAP - the level that will be started. It must be saved in public/data/maps/
- FPS - the frame rate on the server update loop. Default: 60
- PORT - the port the server will be started
- CORRECTION_TIME_STEP - in what interval should corrections be sent. Default: 3000
- FRIENDLY_FIRE - should friendly fire be on

License
-------
See COPYING for more info
