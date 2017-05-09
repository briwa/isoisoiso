var game = new Phaser.Game(600, 400, Phaser.AUTO, 'test', null, true, false);

var BasicGame = function (game) { };

BasicGame.Boot = function (game) { };

var isoGroup,
  cursorPos,
  player,
  playerPos,
  tileSize = 38,
  grid = [
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0]
  ];

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
        tile = game.add.isoSprite(i * tileSize, j * tileSize, 0, 'tile', 0, isoGroup);
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
        return null;
      } else if ( prev[0] == next[0] ) {
        return prev[1] > next[1] ? 'up' : 'down';
      } else if ( prev[1] == next[1] ) {
        return prev[0] > next[0] ? 'left' : 'right';
      }
    };

    game.input.onDown.add(function() {
      // todo: find out why cursorPosX / cursorPosY sometimes returns negative value
      var cursorPosX = Math.floor( cursorPos.x / tileSize );
      var cursorPosY = Math.floor( cursorPos.y / tileSize );

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

        var path = finder.findPath( playerPos.x, playerPos.y, cursorPosX, cursorPosY, matrix );

        if ( path.length <= 1 ) return;

        var tweenedPath = path.reduce(function(newPath, next) {
          // always take the last position as the reference
          // if there's none, use the first position as the current one
          var currPos = newPath[ newPath.length - 1 ] || { coord : next };

          // assign direction for the next one
          newPath.push({ coord : next, dir : getDir( currPos.coord, next ) || 'init' });

          return newPath;
        }, []);

        function startTween( path ) {
          var curr = path[0];
          if ( !curr ) return;

          // slice now to get the remaining path right away
          // since we're using it for references below
          var remainingPath = path.slice( 1 )

          // set the position now, since the tween wont break in the middle of the action anyway
          // the position will definitely being set to the next one
          playerPos.set( curr.coord[0], curr.coord[1] );
          var currDirAnim = 'walk-' + curr.dir;

          var tween = game.add.tween( player ).to({
            isoX : playerPos.x * tileSize,
            isoY : playerPos.y * tileSize
          }, 500, Phaser.Easing.Linear.None, false);

          tween.onStart.add(function( sprite ) {
            // if there's no more path, and the direction is the same, this means it's a one-step path
            // direction can be the same, e.g you're facing down and you move one step down
            // since that is the only path, we need to play the animations regardless
            if ( ! remainingPath.length || sprite.animations.currentAnim.name !== currDirAnim ) {
              sprite.animations.play( currDirAnim );
            }
          });

          tween.onComplete.add(function( sprite ) {
            // only stop when there's no more paths left
            // we want the animation to run seamlessly
            if ( ! remainingPath.length ) {
              sprite.animations.stop( currDirAnim, true );
            }

            startTween( remainingPath );
          });

          tween.start();
        }

        // do not include the first path since the first one is just the initial position
        startTween( tweenedPath.slice( 1 ) );
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
