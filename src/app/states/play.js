import Phaser from 'phaser-ce';
import PF from 'pathfinding';

import Player from '../chars/player';

import { TILESIZE, GRID, TILE } from '../maps/default';

class Play extends Phaser.State {
  constructor() {
    super();

    this.isoGroup = null;
    this.gridCursor = new Phaser.Plugin.Isometric.Point3();

    this.player = null;
    this.activePaths = [];
  }

  preload() {
    // https://opengameart.org/content/isometric-people
    this.game.load.spritesheet('people', 'assets/images/people.png', 32, 50);

    // http://www.pixeljoint.com/pixelart/66809.htm
    this.game.load.atlasJSONHash('tileset', 'assets/images/tileset.png', 'assets/images/tileset.json');

    this.game.time.advancedTiming = true;

    // Add and enable the plug-in.
    this.game.plugins.add(new Phaser.Plugin.Isometric(this.game));

    // This is used to set a game canvas-based offset
    // for the 0, 0, 0 isometric coordinate - by default
    // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
    this.game.iso.anchor.setTo(0.5, 0.2);
  }

  create() {
    this.isoGroup = this.game.add.group();

    // Let's make a load of tiles on a grid.
    for (let i = 0; i < GRID.length; i += 1) {
      for (let j = 0; j < GRID[i].length; j += 1) {
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        const grid = GRID[i][j];
        const tile = TILE[grid];
        const tileSprite = this.game.add.isoSprite(j * TILESIZE, i * TILESIZE, tile.isoZ, 'tileset', tile.name, this.isoGroup);
        tileSprite.anchor.set(tile.anchor[0], tile.anchor[1]);
        tileSprite.smoothed = false;
      }
    }

    this.player = new Player(this.game, 0, 0, 0, 'people', 0, this.isoGroup);

    this.game.input.onDown.add(() => {
      // todo: find out why cursor.x / cursor.y sometimes returns negative value
      const cursor = {
        x: Math.floor(this.gridCursor.x / TILESIZE),
        y: Math.floor(this.gridCursor.y / TILESIZE),
      };

      // ignore out of bounds clicks
      if (cursor.x >= 0 && cursor.y >= 0 && cursor.x < GRID.length && cursor.y < GRID.length) {
        const matrix = new PF.Grid(GRID);
        const finder = new PF.AStarFinder();

        const paths = finder.findPath(
          this.player.currPos.x, this.player.currPos.y,
          cursor.x, cursor.y,
          matrix,
        );

        this.activePaths = paths;

        this.player.move(paths, () => {
          this.activePaths = [];
        });
      }
    });
  }

  update() {
    // Update the cursor position.
    // It's important to understand that screen-to-isometric projection means
    // you have to specify a z position manually, as this cannot be easily
    // determined from the 2D pointer position without extra trickery.
    // By default, the z position is 0 if not set.
    this.game.iso.unproject(this.game.input.activePointer.position, this.gridCursor);

    this.isoGroup.forEach((t) => {
      const tile = t;
      const inBounds = tile.isoBounds.containsXY(this.gridCursor.x, this.gridCursor.y);
      const moving = this.activePaths.length > 0;

      if (moving) {
        // TODO: optimize this, can we do something like this.activePaths.x.indexOf(tile.x) >= 0?
        this.activePaths.forEach((p) => {
          const inPath = tile.isoBounds.containsXY(p[0] * TILESIZE, p[1] * TILESIZE);

          if (!tile.inPath && inPath) {
            // If it does, do a little animation and tint change.
            tile.inPath = true;
          }
        });
      } else {
        tile.inPath = false;
      }

      // Test to see if the 3D position from above intersects
      // with the automatically generated IsoSprite tile bounds.
      if (tile.inPath) {
        tile.tint = 0xff0000;
      } else if (!tile.selected && inBounds && !tile.inPath) {
        // If it does, do a little animation and tint change.
        tile.selected = true;
        tile.tint = 0x86bfda;
      } else if ((tile.selected && !inBounds) || !moving) {
        // If not, revert back to how it was.
        tile.selected = false;
        tile.tint = 0xffffff;
      }
    });

    this.game.iso.topologicalSort(this.isoGroup);
  }

  render() {
    this.game.debug.text(JSON.stringify(this.activePaths), 0, 32);
  }
}

export default Play;
