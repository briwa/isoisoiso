import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import Hero from 'src/app/chars/hero';
import { MovementTrack, MovementFollow } from 'src/app/sprites/human';

interface Option {
  name: string;
  confirm: boolean;
};

interface Conversation {
  id: number;
  type: string;
  text?: string;
  conversations?: Conversation[];
  options?: Option[];
  onSelect?: (subject: Hero, option: Option) => number;
};

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  map: any;
  x?: number;
  y?: number;
  delimiter: number;
  movement?: MovementTrack | MovementFollow;
  conversations: Conversation[];
  name: string;
  hero: Hero;
};

class Npc extends Human {
  private index: number = 0;
  private forward: boolean = true;
  private pause: number = 2000;
  private npc: boolean = true;

  public contact: boolean = false;
  public conversations: Conversation[];

  constructor({ x, y, game, group, map, movement, delimiter, conversations, name, hero }: Config) {
    super({
      game,
      x: x * map.tilesize,
      y: y * map.tilesize,
      z: 0,
      sprite: 'people',
      delimiter,
      group,
      map,
      movement,
    });

    this.npc = true;
    this.name = name;
    this.conversations = conversations;
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

    // event setup
    // ---------------
    hero.listen('action', () => {
      // check if any npc is in contact
      if (this.contact && !this.paused) {
        this.showDialog({
          hero,
          npc: this,
          conversations: this.conversations,
        });
        this.stopOppositeAnimation(hero.currentAnimation().name);
      }
    });
  }

  moveTrack(timeout: number) {
    const track = this.movement.input;
    setTimeout(() => {
      // do not move when it's paused
      if (this.paused) {
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
