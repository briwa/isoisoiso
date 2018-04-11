import Phaser from 'phaser-ce';
import PF from 'pathfinding';

import Player from '../chars/player';

const TILESIZE = 36;
const GRID = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 3, 0, 0, 0],
  [0, 0, 1, 1, 3, 0, 0, 0],
  [0, 0, 1, 1, 3, 2, 0, 0],
  [3, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 3, 0, 0],
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

class Play extends Phaser.State {
  constructor() {
    super();

    this.isoGroup = null;
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

    const newPlayer = new Player(this.game, 0, 0, 0, 'people', 0, this.isoGroup);

    this.game.input.onDown.add((pointer) => {
      newPlayer.move(pointer.position);
    });
  }

  update() {
    this.game.iso.topologicalSort(this.isoGroup);
  }
}

export default Play;
