import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import { MovementMouse, MovementKeys } from 'src/app/sprites/human';
import SpriteIngame from 'src/app/sprites/ingame';

import { get as getItem, getAll as getAllItems, Item } from 'src/app/chars/items';

interface Equips {
  armor: Item;
  weapon: Item;
  accessory: Item;
};

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  map: any;
  x?: number;
  y?: number;
  movement: MovementMouse | MovementKeys;
  controls: { [key:string]: Phaser.Key };
};

interface Inventory extends Item {
  equipped: boolean;
};

class Hero extends Human {
  private debug: boolean = false;
  private ingame: SpriteIngame;
  private equipment: Equips = {
    armor: null,
    weapon: null,
    accessory: null,
  };
  private status = {
    hp: 100,
    mp: 100,
    atk: 10,
    def: 10,
  };

  public controls: { [key:string]: Phaser.Key };
  public gold: number = 100;
  public inventory: Inventory[] = [];

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

    // stupid
    this.inventory = getAllItems().map(item => ({
      ...item,
      equipped: item.consumable ? null : false,
    }))

    this.ingame = new SpriteIngame({
      id: 'ingame',
      game: this.game,
      subject: this,
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

    this.controls.o.onDown.add(() => {
      if (!this.ingame.sprite.visible && this.inMap) {
        this.ingame.show();
      } else {
        this.ingame.hide();
        this.resetView(); // force to always show the map
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
    this.inventory.push({
      ...item,
      equipped : item.consumable ? null : false,
    });
  }

  setEquipped(id: string, equipped: boolean) {
    const item = this.inventory.filter(i => id === i.id)[0];
    item.equipped = equipped;
  }

  useItem(item: Inventory) {
    if (!item.consumable) return;
    this.applyItemEffect(item.id);
  }

  discardItem(item: Inventory) {
    if (item.equipped) return;
    this.inventory = this.inventory.filter(i => item.id !== i.id);
  }

  equipItem(id: string) {
    const item = getItem(id);
    if (item.consumable) return; // shouldn't be able to equip a consumable

    // unequip the existing one first
    if (this.equipment[item.type]) {
      this.unequipItem(this.equipment[item.type].id);
    }

    this.equipment[item.type] = item;
    this.applyItemEffect(item.id);
    this.setEquipped(id, true);
  }

  unequipItem(id: string) {
    const item = getItem(id);
    if (item.consumable) return; // shouldn't be able to equip a consumable

    this.equipment[item.type] = null;
    this.applyItemEffect(item.id, true);
    this.setEquipped(id, false);
  }

  applyItemEffect(id: string, negate = false) {
    const item = getItem(id);

    item.effects.forEach((effect) => {
      this.status[effect.property] = this.status[effect.property] + (effect.value * (negate ? -1 : 1));
    });
  }
}

export default Hero;
