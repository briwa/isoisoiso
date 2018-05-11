import Phaser from 'phaser-ce';

import Human from './human';
import { MovementTrack, MovementFollow } from '../sprites/human';

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  map: any;
  x?: number;
  y?: number;
  movement: MovementTrack | MovementFollow;
};

class Npc extends Human {
  private index: number;
  private forward: boolean;

  constructor({ x, y, game, group, map, movement }: Config) {
    const z = 0;
    const sprite = 'people';
    const delimiter = 129;

    super({
      game,
      x: x * map.tilesize,
      y: y * map.tilesize,
      z,
      sprite,
      delimiter,
      group,
      map,
      movement,
    });

    this.index = 0;
    this.forward = true;

    if (this.movement.type === 'follow') {
      const follow = this.movement.input;
      const onFollow = () => {
        this.generatePaths({
          x: follow.position(true).x,
          y: follow.position(true).y,
        });

        // also follow the char on every path
        follow.listenOnce('pathEnd', () => {
          onFollow();
        });
      };

      onFollow();
    } else if (this.movement.type === 'track') {
      this.moveTrack();
    }
  }

  moveTrack() {
    const track = this.movement.input;
    setTimeout(() => {
      this.generatePaths({
        x: track[this.index][0],
        y: track[this.index][1],
        onFinished: () => {
          this.setNextIndex();
          this.moveTrack();
        },
      });
    }, 2000);
  }

  setNextIndex() {
    const track = this.movement.input;

    this.forward =
      (this.forward && !!track[this.index + 1]) ||
      (!this.forward && !track[this.index - 1]);

    if (this.forward) {
      this.index += 1;
    } else {
      this.index -= 1;
    }
  }
}

export default Npc;
