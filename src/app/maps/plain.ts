import * as PF from 'pathfinding';

const TILESIZE = 36;

const GRID = [
  [0, 0, 2, 3, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 2, 0, 0, 0, 0, 0],
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

export default class PlainMap {
  private grid;
  private tilesize;
  private tile;
  private group;
  private game;
  private debugging;

  static loadAssets(game) {
    // http://www.pixeljoint.com/pixelart/66809.htm
    game.load.atlasJSONHash('tileset', 'assets/images/tileset.png', 'assets/images/tileset.json');
  }

  constructor(game) {
    this.grid = [...GRID];
    this.tilesize = TILESIZE;
    this.tile = TILE;

    this.debugging = true;

    if (game) this.setup(game);
  }

  findPath(x, y, x1, y1) {
    const matrix = new PF.Grid(this.grid);
    const finder = new PF.AStarFinder();

    return finder.findPath(x, y, x1, y1, matrix);
  }

  setWalkable(x, y, walkable) {
    this.grid[y][x] = walkable ? 0 : 9;
  }

  // also side effects
  // mainly to append all grids into phaserjs canvas. in isometric fashion
  setup(game) {
    this.game = game;

    this.group = this.game.add.group();

    // Let's make a load of tiles on a grid.
    for (let i = 0; i < this.grid.length; i += 1) {
      for (let j = 0; j < this.grid[i].length; j += 1) {
        // Create a tile using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        const grid = this.grid[i][j];
        const tile = this.tile[grid];
        const tileSprite = this.game.add.isoSprite(j * TILESIZE, i * TILESIZE, tile.isoZ, 'tileset', tile.name, this.group);
        tileSprite.anchor.set(tile.anchor[0], tile.anchor[1]);
        tileSprite.smoothed = false;
      }
    }
  }

  debug({ cursor, paths }) {
    if (!this.debugging) return;

    this.group.forEach((t) => {
      const tile = t;

      // not debugging people tile!
      if (tile.key === 'people') return;

      if (tile.inPath || tile.walkable) {
        // Clear tint from previous path
        tile.tint = 0xffffff;
      }

      const x = tile.isoX / this.tilesize;
      const y = tile.isoY / this.tilesize;

      const inPath = paths.some(point => point[0] === x && point[1] === y);
      if (inPath) {
        tile.tint = 0xbbbbbb;
        tile.inPath = true;
      } else {
        tile.inPath = false;
      }

      const walkable = this.grid[y][x] !== 0;
      if (walkable) {
        tile.walkable = true;
        tile.tint = 0x444444;
      } else {
        tile.walkable = false;
      }

      const inBounds = tile.isoBounds.containsXY(cursor.x, cursor.y);
      if (!tile.selected && inBounds && !tile.inPath && !tile.walkable) {
        // If it does, do a little animation and tint change.
        tile.selected = true;
        tile.tint = 0xff4400;
      } else if (tile.selected && !inBounds) {
        // If not, revert back to how it was.
        tile.selected = false;
        tile.tint = 0xffffff;
      }
    });
  }

  sortSprites() {
    this.game.iso.topologicalSort(this.group);
  }
}
