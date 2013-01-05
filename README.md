General
=======

This is a fast paced game using melonJS as engine. It is supposed to be a massive multiplayer but it is currently in development. Currently I have not came with an idea how to name the game, so if you thought of a good name, you can email me on nvl.bg.rules@gmail.com


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

How to build with Grunt
-------------
To build with grunt, you must have grunt-cli and grunt 0.4 already installed. If you have run `npm install` you already have grunt 0.4, but you must also have grunt-cli. If you don't have it, install it with this command:

`$ npm install -g grunt-cli`

This will not only install it, but it will be installed globally, so you can use it in other projects as well. For more information visit [gruntjs homepage] or [gruntjs repository]

Now you can build the project with:

`$ grunt`

This will validate the .js files, will concatenate the public files, minify them and save them in public/build/

License
-------
See COPYING for more info

[gruntjs homepage]: http://gruntjs.com/
[gruntjs repository]: https://github.com/gruntjs/grunt/