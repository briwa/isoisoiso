import Phaser from 'phaser-ce';

import { Config } from 'src/app/sprites/human';
import Human from 'src/app/chars/base/human';
import Hero from 'src/app/chars/hero';

import { MovementTrack, MovementFollow } from 'src/app/sprites/human';

export interface ConfigNpc extends Config {
  game: Phaser.Game;
  group: Phaser.Group;
  map: any;
  x?: number;
  y?: number;
  delimiter: number;
  movement?: MovementTrack | MovementFollow;
  name: string;
  hero: Hero;
};

class Npc extends Human {
  private index: number = 0;
  private forward: boolean = true;
  private pause: number = 2000;
  private npc: boolean = true;

  contact: boolean = false;

  constructor({ x, y, game, group, map, movement, delimiter, name, hero, initFrame }: ConfigNpc) {
    super({
      game,
      x: x * map.tilesize,
      y: y * map.tilesize,
      z: 0,
      sprite: 'people',
      delimiter,
      initFrame,
      group,
      map,
      movement,
    });

    this.npc = true;
    this.name = name;
    this.setImmovable(true);

    // movement setup
    // ---------------
    if (this.movement) {
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
        this.moveTrack(this.pause);
      }
    }
  }

  moveTrack(timeout: number) {
    const track = this.movement.input;
    setTimeout(() => {
      // do not move when it's not in the map, e.g. in a conversation
      if (!this.inMap) {
        this.moveTrack(this.pause);
        return false;
      }

      this.generatePaths({
        x: track[this.index][0],
        y: track[this.index][1],
        onFinished: () => {
          this.setNextIndex();
          this.moveTrack(this.contact ? this.pause / 2 : this.pause);
        },
      });
    }, timeout);
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
