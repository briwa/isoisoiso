import PF from 'pathfinding';

export const TILESIZE = 36;

export const GRID = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

export const TILE = [
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

export const MAP = {
  findPath(x, y, x1, y1) {
    const matrix = new PF.Grid(GRID);
    const finder = new PF.AStarFinder();

    return finder.findPath(x, y, x1, y1, matrix);
  },
  setWalkable(x, y, walkable) {
    GRID[y][x] = walkable ? 0 : 9;
  },
};
