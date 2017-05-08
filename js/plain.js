var game = new Phaser.Game(600, 400, Phaser.AUTO, 'test', null, true, false);

var BasicGame = function (game) { };

BasicGame.Boot = function (game) { };

var isoGroup,
  currentPos,
  cursorPos,
  cursor,
  player,
  playerPos,
  playerTween,
  grid,
  gridSize,
  path;

BasicGame.Boot.prototype = {
  preload: function () {
    game.load.image('tile', 'assets/tile.png');
    game.load.image('cube', 'assets/cube.png');

    // https://opengameart.org/content/isometric-people
    game.load.spritesheet('people', 'assets/people.png', 32, 50);

    game.time.advancedTiming = true;

    // Add and enable the plug-in.
    game.plugins.add(new Phaser.Plugin.Isometric(game));

    // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
    // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
    game.iso.anchor.setTo(0.5, 0.2);

    gridSize = 64;
    grid = [
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0]
    ];
    path = [];
  },
  create: function () {

    // Create a group for our tiles.
    isoGroup = game.add.group();

    // Let's make a load of tiles on a grid.
    var tile;
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        tile = game.add.isoSprite(i * 38, j * 38, 0, 'tile', 0, isoGroup);
        tile.anchor.set(0.5, 0);
      }
    }

    // Provide a 3D position for the cursor
    cursorPos = new Phaser.Plugin.Isometric.Point3();
    playerPos = new Phaser.Plugin.Isometric.Point3();

    // Create another cube as our 'player', and set it up just like the cubes above.
    player = game.add.isoSprite(0, 0, 0, 'people', 0);
    player.animations.add( 'walk-up', [ 30, 31, 32, 33, 34, 35, 36, 37, 38 ], 30, true);
    player.animations.add( 'walk-left', [ 20, 21, 22, 23, 24, 25, 26, 27, 28 ], 30, true);
    player.animations.add( 'walk-right', [ 10, 11, 12, 13, 14, 15, 16, 17, 18 ], 30, true);
    player.animations.add( 'walk-down', [ 0, 1, 2, 3, 4, 5, 6, 7, 8 ], 30, true);
    player.anchor.set(0.5);

    var getDir = function( prev, next ) {
      if ( prev[0] == next[0] && prev[1] == next[1] ) {
        return 'init';
      } else if ( prev[0] == next[0] ) {
        return prev[1] > next[1] ? 'up' : 'down';
      } else if ( prev[1] == next[1] ) {
        return prev[0] > next[0] ? 'left' : 'right';
      }
    };

    game.input.onDown.add(function() {
      // todo: find out why cursorPosX / cursorPosY sometimes returns negative value
      var cursorPosX = Math.floor( cursorPos.x / 38 );
      var cursorPosY = Math.floor( cursorPos.y / 38 );

      // ignore out of bounds clicks
      // also when the player is still moving
      if (
        ! player.animations.currentAnim.isPlaying
        && cursorPosX >= 0 && cursorPosY >= 0
        && cursorPosX < grid.length
        && cursorPosY < grid.length
      ) {
        var matrix = new PF.Grid( grid );
        var finder = new PF.AStarFinder();

        path = finder.findPath( playerPos.x, playerPos.y, cursorPosX, cursorPosY, matrix );

        if ( path.length <= 1 ) return;

        var tweenedPath = path.reduce(function(newPath, next) {
          // always take the last position as the reference
          // if there's none, use the first position as the current one
          var currPos = newPath[ newPath.length - 1 ] || { coord : next };

          // where is this next piece of position heading to?
          var nextPos = { coord : next, dir : getDir( currPos.coord, next ) };

          // the next position is going to the same direction
          // also, when it's an initial position, it follows the next direction
          // just add the speed and update the position of the current
          // no need to register this one as new position
          if ( currPos.dir === 'init' || nextPos.dir === currPos.dir ) {
            currPos.speed++;
            currPos.coord = nextPos.coord;
            currPos.dir = nextPos.dir;
          } else {
            // register the next position as new position
            // initial position won't have initial speed
            // different paths mean it's taking a turn, hence the 1 initial speed
            nextPos.speed = nextPos.dir === 'init' ? 0 : 1;
            newPath.push(nextPos);
          }

          return newPath;
        }, []);

        function startTween( path ) {
          var curr = path[0];
          if ( curr ) {
            playerPos.set( curr.coord[0], curr.coord[1] );

            var tween = game.add.tween( player ).to({
              isoX : playerPos.x * 38,
              isoY : playerPos.y * 38
            }, curr.speed * 500, Phaser.Easing.Linear.None, false);

            tween.onStart.add(function() {
              player.animations.play( 'walk-' + curr.dir );
            });

            tween.onComplete.add(function() {
              player.animations.stop( 'walk-' + curr.dir, true );
              startTween( path.slice( 1 ) );
            });

            tween.start();
          }
        }

        startTween( tweenedPath );
      }
    });
  },
  update: function () {
    // Update the cursor position.
    // It's important to understand that screen-to-isometric projection means you have to specify a z position manually, as this cannot be easily
    // determined from the 2D pointer position without extra trickery. By default, the z position is 0 if not set.
    game.iso.unproject(game.input.activePointer.position, cursorPos);

    // Loop through all tiles and test to see if the 3D position from above intersects with the automatically generated IsoSprite tile bounds.
    isoGroup.forEach(function (tile) {
      var inBounds = tile.isoBounds.containsXY(cursorPos.x, cursorPos.y);
      // If it does, do a little animation and tint change.
      if (!tile.selected && inBounds) {
        tile.selected = true;
        tile.tint = 0x86bfda;
      }
      // If not, revert back to how it was.
      else if (tile.selected && !inBounds) {
        tile.selected = false;
        tile.tint = 0xffffff;
      }
    });
  },
  render: function () {
    game.debug.text(game.time.fps || '--', 2, 14, "#000");
  }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
