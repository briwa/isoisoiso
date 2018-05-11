import Phaser from 'phaser-ce';

import Human from './human';
import { MovementMouse, MovementKeys } from '../sprites/human';

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  map: any;
  x?: number;
  y?: number;
  movement: MovementMouse | MovementKeys;
};

class Hero extends Human {
  constructor({ x, y, game, group, map, movement }: Config) {
    const z = 0;
    const sprite = 'people';
    const delimiter = 0;

    super({
      game,
      x,
      y,
      z,
      sprite,
      delimiter,
      group,
      map,
      movement,
    });

    // register mouse down input upon `create` bc we only need to do it once
    if (this.movement.type === 'mouse') {
      game.input.onDown.add(() => {
        // for hero movement
        const movement = <MovementMouse> this.movement;
        const cursor = {
          x: Math.floor(movement.input.x / map.tilesize),
          y: Math.floor(movement.input.y / map.tilesize),
        };

        // ignore out of bounds clicks
        if (cursor.x >= 0 && cursor.y >= 0 && cursor.x < map.grid.length && cursor.y < map.grid.length) {
          this.generatePaths({
            x: cursor.x,
            y: cursor.y,
          });
        }
      });
    }
  }
}

export default Hero;
