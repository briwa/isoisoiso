import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import { MovementMouse, MovementKeys } from 'src/app/sprites/human';

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  map: any;
  x?: number;
  y?: number;
  movement: MovementMouse | MovementKeys;
  controls: { [key:string]: Phaser.Key };
};

class Hero extends Human {
  public controls: { [key:string]: Phaser.Key };

  constructor({ x, y, game, group, map, movement, controls }: Config) {
    super({
      game,
      x: x * map.tilesize,
      y: y * map.tilesize,
      z: 0,
      sprite: 'people',
      delimiter: 0,
      group,
      map,
      movement,
    });

    this.controls = controls;

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

    // register keyboard controls
    this.controls.p.onDown.add(() => {
      this.dispatch('action');
    });
  }
}

export default Hero;
