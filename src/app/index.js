import Phaser from 'phaser-ce';
import PF from 'pathfinding';

const game = new Phaser.Game(600, 600, Phaser.AUTO);

const TILESIZE = 36;
const GRID = [
  [0, 0, 0, 0, 2, 0, 0, 0],
  [0, 0, 1, 1, 3, 0, 0, 0],
  [0, 0, 0, 0, 2, 0, 2, 0],
  [0, 0, 0, 0, 0, 0, 1, 1],
  [3, 2, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 2, 0, 0, 1, 1],
  [1, 1, 0, 0, 0, 0, 0, 0],
];

const TILE = [
  {
    name: 'grass',
    isoZ: 0,
    anchor: [0.5, 0],
  },
  {
    name: 'wall',
    isoZ: 4,
    anchor: [0.5, 0.5],
  },
  {
    name: 'bush1',
    isoZ: 13,
    anchor: [0.5, 0],
  },
  {
    name: 'bush2',
    isoZ: 13,
    anchor: [0.5, 0],
  },
];

let isoGroup;

// it needs this format of functions for Phaser to work
function BasicGame() { }
BasicGame.Boot = function Boot() { };

BasicGame.Boot.prototype = {
  preload() {
    // https://opengameart.org/content/isometric-people
    game.load.spritesheet('people', 'assets/images/people.png', 32, 50);

    // http://www.pixeljoint.com/pixelart/66809.htm
    game.load.atlasJSONHash('tileset', 'assets/images/tileset.png', 'assets/images/tileset.json');

    game.time.advancedTiming = true;

    // Add and enable the plug-in.
    game.plugins.add(new Phaser.Plugin.Isometric(game));

    // This is used to set a game canvas-based offset
    // for the 0, 0, 0 isometric coordinate - by default
    // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
    game.iso.anchor.setTo(0.5, 0.2);
  },
  create() {
    isoGroup = game.add.group();

    // Let's make a load of tiles on a grid.
    for (let i = 0; i < GRID.length; i += 1) {
      for (let j = 0; j < GRID[i].length; j += 1) {
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        const grid = GRID[i][j];
        const tile = TILE[grid];
        const tileSprite = game.add.isoSprite(j * TILESIZE, i * TILESIZE, tile.isoZ, 'tileset', tile.name, isoGroup);
        tileSprite.anchor.set(tile.anchor[0], tile.anchor[1]);
        tileSprite.smoothed = false;
      }
    }

    // Provide a 3D position for the cursor and the player
    const cursorPos = new Phaser.Plugin.Isometric.Point3();
    const playerPos = new Phaser.Plugin.Isometric.Point3();

    // Use the sprite from above as player
    const player = game.add.isoSprite(0, 0, 0, 'people', 0, isoGroup);
    player.animations.add('walk-up', [30, 31, 32, 33, 34, 35, 36, 37, 38], 30, true);
    player.animations.add('walk-left', [20, 21, 22, 23, 24, 25, 26, 27, 28], 30, true);
    player.animations.add('walk-right', [10, 11, 12, 13, 14, 15, 16, 17, 18], 30, true);
    player.animations.add('walk-down', [0, 1, 2, 3, 4, 5, 6, 7, 8], 30, true);
    player.anchor.set(0.5);

    const getDir = (prev, next) => {
      if (prev[0] === next[0] && prev[1] === next[1]) {
        return null;
      } else if (prev[0] === next[0]) {
        return prev[1] > next[1] ? 'up' : 'down';
      } else if (prev[1] === next[1]) {
        return prev[0] > next[0] ? 'left' : 'right';
      }

      return false;
    };

    game.input.onDown.add(() => {
      // Update the cursor position.
      // It's important to understand that screen-to-isometric projection means
      // you have to specify a z position manually, as this cannot be easily
      // determined from the 2D pointer position without extra trickery.
      // By default, the z position is 0 if not set.
      game.iso.unproject(game.input.activePointer.position, cursorPos);

      // todo: find out why cursorPosX / cursorPosY sometimes returns negative value
      const cursorPosX = Math.floor(cursorPos.x / TILESIZE);
      const cursorPosY = Math.floor(cursorPos.y / TILESIZE);

      // ignore out of bounds clicks
      // also when the player is still moving
      if (
        !player.animations.currentAnim.isPlaying
        && cursorPosX >= 0 && cursorPosY >= 0
        && cursorPosX < GRID.length
        && cursorPosY < GRID.length
      ) {
        const matrix = new PF.Grid(GRID);
        const finder = new PF.AStarFinder();

        const path = finder.findPath(playerPos.x, playerPos.y, cursorPosX, cursorPosY, matrix);

        if (path.length <= 1) return;

        const tweenedPath = path.reduce((newPath, next) => {
          // always take the last position as the reference
          // if there's none, use the first position as the current one
          const currPos = newPath[newPath.length - 1] || { coord: next };

          // assign direction for the next one
          newPath.push({ coord: next, dir: getDir(currPos.coord, next) || 'init' });

          return newPath;
        }, []);

        const startTween = (tweenPath) => {
          const curr = tweenPath[0];
          if (!curr) return;

          // slice now to get the remaining path right away
          // since we're using it for references below
          const remainingPath = tweenPath.slice(1);

          // set the position now, since the tween wont break in the middle of the action anyway
          // the position will definitely being set to the next one
          playerPos.set(curr.coord[0], curr.coord[1]);
          const currDirAnim = `walk-${curr.dir}`;

          const tween = game.add.tween(player).to({
            isoX: playerPos.x * TILESIZE,
            isoY: playerPos.y * TILESIZE,
          }, 500, Phaser.Easing.Linear.None, false);

          tween.onStart.add((sprite) => {
            // do not play the same animation twice
            // if this is the first movement (from static to moving),
            // always play the animation regardless
            const currentAnim = sprite.animations.currentAnim;
            if (!currentAnim.isPlaying || currentAnim.name !== currDirAnim) {
              sprite.animations.play(currDirAnim);
            }
          });

          tween.onComplete.add((sprite) => {
            // only stop when there's no more paths left
            // we want the animation to run seamlessly
            if (!remainingPath.length) {
              sprite.animations.stop(currDirAnim, true);
            }

            startTween(remainingPath);
          });

          tween.start();
        };

        // do not include the first path since the first one is just the initial position
        startTween(tweenedPath.slice(1));
      }
    });
  },
  update() {
    game.iso.topologicalSort(isoGroup);
  },
  render() {},
};

game.state.add('Boot', BasicGame.Boot);
game.state.start('Boot');
