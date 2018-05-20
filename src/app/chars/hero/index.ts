import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import { MovementMouse, MovementKeys } from 'src/app/sprites/human';
import Dialog from 'src/app/sprites/dialog';

import { get as getItem } from 'src/app/chars/items';

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
  private inventory: any[] = [];
  private debug: boolean = false;
  private dialog: Dialog;

  public controls: { [key:string]: Phaser.Key };
  public gold: number = 100;

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

    this.name = 'Hero';
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
    this.controls.l.onDown.add(() => {
      this.dispatch('cancel');
    });
    this.controls.w.onDown.add(() => {
      this.dispatch('up');
    });
    this.controls.s.onDown.add(() => {
      this.dispatch('down');
    });

    // temporary UI for menu
    this.controls.o.onDown.add(() => {
      if (this.dialog && this.dialog.sprite.alive) {
        this.dialog.done();
      } else {
        const inventory = this.inventory.map(item => item.name).join('\n');
        const conversations = [{
          id: '1',
          type: 'dialog',
          text: `Gold: ${this.gold}\n${inventory}`,
        }];

        this.dialog = this.showDialog({
          subject: this,
          dialog: {
            id: 'ingame-menu',
            conversations: conversations,
          },
        });
      }
    });

    // DEBUGGING
    this.controls[','].onDown.add(() => {
      if (this.debug) {
        this.gold += 1000;
      }
    });

    this.controls['.'].onDown.add(() => {
      this.debug = !this.debug;
    });
  }

  purchase(id: string) {
    const item = getItem(id);
    this.gold -= item.price;
    this.inventory.push(item);
  }
}

export default Hero;
