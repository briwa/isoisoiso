import Phaser from 'phaser-ce';

import Player from '../chars/player';
import Npc from '../chars/npc';
import { TILESIZE, GRID, TILE, MAP } from '../maps/default';

class Play extends Phaser.State {
  constructor() {
    super();

    this.mapGroup = null;
    this.charGroup = null;

    this.gridCursor = new Phaser.Plugin.Isometric.Point3();

    this.player = null;
    this.activePaths = [];
  }

  preload() {
    // https://opengameart.org/content/isometric-people
    this.game.load.spritesheet('people', 'assets/images/people.png', 32, 49);

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
    this.mapGroup = this.game.add.group();
    this.charGroup = this.game.add.group();

    // Let's make a load of tiles on a grid.
    for (let i = 0; i < GRID.length; i += 1) {
      for (let j = 0; j < GRID[i].length; j += 1) {
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        const grid = GRID[i][j];
        const tile = TILE[grid];
        const tileSprite = this.game.add.isoSprite(j * TILESIZE, i * TILESIZE, tile.isoZ, 'tileset', tile.name, this.mapGroup);
        tileSprite.anchor.set(tile.anchor[0], tile.anchor[1]);
        tileSprite.smoothed = false;
      }
    }

    this.player = new Player({
      game: this.game,
      x: 0,
      y: 0,
      z: 0,
      sprite: 'people',
      delimiter: 0,
      group: this.charGroup,
      map: MAP,
    });

    this.npc = new Npc({
      game: this.game,
      group: this.charGroup,
      map: MAP,
    });
    this.npc.moveTrack(this.player);

    this.game.input.onDown.add(() => {
      // todo: find out why cursor.x / cursor.y sometimes returns negative value
      const cursor = {
        x: Math.floor(this.gridCursor.x / TILESIZE),
        y: Math.floor(this.gridCursor.y / TILESIZE),
      };

      // ignore out of bounds clicks
      if (cursor.x >= 0 && cursor.y >= 0 && cursor.x < GRID.length && cursor.y < GRID.length) {
        this.player.move({
          x: cursor.x,
          y: cursor.y,
          start: (paths) => {
            this.activePaths = paths;
          },
          done: () => {
            this.activePaths = [];
          },
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

    this.mapGroup.forEach((t) => {
      const tile = t;
      const inBounds = tile.isoBounds.containsXY(this.gridCursor.x, this.gridCursor.y);

      if (tile.inPath) {
        // Clear tint from previous path
        tile.tint = 0xffffff;
      }
      const x = tile.isoX / TILESIZE;
      const y = tile.isoY / TILESIZE;
      const inPath = this.activePaths.some(point => point[0] === x && point[1] === y);
      if (inPath) {
        tile.tint = 0xff0000;
        tile.inPath = true;
      } else {
        tile.inPath = false;
      }

      if (!tile.selected && inBounds && !tile.inPath) {
        // If it does, do a little animation and tint change.
        tile.selected = true;
        tile.tint = 0x86bfda;
      } else if (tile.selected && !inBounds) {
        // If not, revert back to how it was.
        tile.selected = false;
        tile.tint = 0xffffff;
      }
    });

    this.game.iso.topologicalSort(this.mapGroup);
  }
}

export default Play;
