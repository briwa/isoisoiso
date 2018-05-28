import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import { Config, MovementMouse, MovementKeys } from 'src/app/sprites/human';
import UIIngame from 'src/app/sprites/ui/ingame';

import { get as getItem, getAll as getAllItems, Item } from 'src/app/chars/items';

interface Equips {
  armor: Item;
  weapon: Item;
  accessory: Item;
};

interface ConfigHero extends Config {
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
  private ingame: UIIngame;

  controls: { [key:string]: Phaser.Key };
  gold: number = 100;
  inventory: Inventory[] = [];
  stats = {
    hp: {
      base: 100,
      extra: 0,
      battle: 100,
    },
    mp: {
      base: 100,
      extra: 0,
      battle: 100,
    },
    atk: {
      base: 10,
      extra: 0,
      battle: 10,
    },
    def: {
      base: 10,
      extra: 0,
      battle: 10,
    },
  };
  equipment: Equips = {
    armor: null,
    weapon: null,
    accessory: null,
  };

  constructor({ x, y, game, group, map, movement, controls, initFrame }: ConfigHero) {
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
      initFrame,
    });

    this.name = 'Hero';
    this.controls = controls;

    this.ingame = new UIIngame({
      id: 'ingame',
      game: this.game,
      subject: this,
    });

    // register mouse down input upon `create` bc we only need to do it once
    if (this.movement && this.movement.type === 'mouse') {
      game.input.onDown.add(() => {
        // for hero movement
        const movement = this.movement as MovementMouse;
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
        // TODO: toggling everything to hide is still not working
        this.ingame.hide();
      }
    });

    // DEBUGGING
    this.controls[','].onDown.add(() => {
      this.game.state.start('Battle');
    });

    this.controls['.'].onDown.add(() => {
      this.game.state.start('Plain');
    });
  }

  setEquipped(id: string, equipped: boolean) {
    const item = this.inventory.filter(i => id === i.id)[0];
    item.equipped = equipped;
  }

  purchaseItem(id: string) {
    const item = getItem(id);
    this.gold -= item.price;

    this.acquireItem(item.id);
  }

  acquireItem(id: string) {
    const item = getItem(id);

    this.inventory.push({
      ...item,
      equipped : item.consumable ? null : false,
    });
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
      const target = item.consumable ? 'battle' : 'extra';
      // consumables can't go higher than the base + extra
      // while non-consumable stacks as permanent extra
      const maxValue = this.stats[effect.property].base + this.stats[effect.property].extra
      const newValue = this.stats[effect.property][target] + (effect.value * (negate ? -1 : 1));

      this.stats[effect.property][target] = item.consumable ? Math.min(maxValue, newValue) : newValue;
    });
  }
}

export default Hero;
