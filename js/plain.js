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
    this.spawnTiles();

    // Provide a 3D position for the cursor
    cursorPos = new Phaser.Plugin.Isometric.Point3();
    playerPos = new Phaser.Plugin.Isometric.Point3();

    // Create another cube as our 'player', and set it up just like the cubes above.
    player = game.add.isoSprite(0, 0, 0, 'cube', 0, isoGroup);
    player.tint = 0x86bfda;
    player.anchor.set(0.5);

    var getDir = function( prev, next ) {
      if ( prev[0] == next[0] ) {
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
      if ( cursorPosX < grid.length && cursorPosY < grid.length ) {
        var matrix = new PF.Grid( grid );
        var finder = new PF.AStarFinder();

        path = finder.findPath( playerPos.x, playerPos.y, cursorPosX, cursorPosY, matrix );

        if ( path.length <= 1 ) return;

        var tweenedPath = path.reduce(function(acc, next) {
          // always take the last path as the reference
          var curr = acc[ acc.length - 1 ];

          // first path ever, don't bother, mark them as init
          if ( ! curr ) {
            acc.push({
              arr : next,
              dir : 'init',
              speed : 0
            });

            return acc;
          }

          // where is this next piece of path heading to?
          var nextDir = getDir( curr.arr, next );

          // current direction is the same with the next one
          // meaning just add the speed, with updated x/y from the next
          // update the direction as well in case the previous one was init
          if ( curr.dir == 'init' || curr.dir == nextDir ) {
            curr.arr[0] = next[0];
            curr.arr[1] = next[1];
            curr.dir = nextDir;
            curr.speed++;
          } else {
            // this means it's making a turn
            // and the turning 'move' itself has 1 speed, hence the initial speed
            acc.push({
              arr : next,
              dir : nextDir,
              speed : 1
            });
          }

          return acc;
        }, []);

        const tweenArr = [];
        for ( var i = 0; i < tweenedPath.length; i++ ) {
          var tween = game.add.tween( player );
          tween.to({
            isoX : tweenedPath[i].arr[0] * 38,
            isoY : tweenedPath[i].arr[1] * 38
          }, tweenedPath[i].speed * 500, Phaser.Easing.Linear.None, false);

          if ( tweenArr.length ) {
            var lastTween = tweenArr[ tweenArr.length - 1 ];
            lastTween.chain( tween );
          }

          tweenArr.push( tween );
        }

        tweenArr[0].start();

        var lastTile = path[path.length - 1];
        playerPos.set( lastTile[0], lastTile[1] );
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
    game.debug.text(path, 2, 30, "#000");
  },
  spawnTiles: function () {
    var tile;
    for (var i = 0; i < grid.length; i++) {
      for (var j = 0; j < grid[i].length; j++) {
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        tile = game.add.isoSprite(i * 38, j * 38, 0, 'tile', 0, isoGroup);
        tile.anchor.set(0.5, 0);
      }
    }
  }
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
