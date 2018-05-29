import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui';
import UIMenu from 'src/app/sprites/ui/menu';
import UIStats from 'src/app/sprites/ui/ingame/stats';
import UIInventory from 'src/app/sprites/ui/ingame/inventory';

import Hero from 'src/app/chars/hero';

interface Config {
  id: string;
  game: Phaser.Game;
  subject: Hero;
};

const width = 480;
const height = 400;
const marginTop = 12;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;
const dividerLeft = 80;
const dividerTop = 40;
const goldLeft = 440;

const menuOptions = [{
  id: '1',
  name: 'Inventory'
}, {
  id: '2',
  name: 'Stats'
}, {
  id: '3',
  name: 'Settings'
}];

class UIIngame extends UIBase {
  private gold: Phaser.Text;

  static createBase(game: Phaser.Game): Phaser.Sprite {
    const graphics = game.add.graphics(0, 0);

    // set a fill and line style
    graphics.beginFill(0x333333);
    graphics.lineStyle(3, 0xdddddd, 1);

    // draw a shape
    graphics.moveTo(0,0);
    graphics.lineTo(width, 0);
    graphics.lineTo(width, height);
    graphics.lineTo(0, height);
    graphics.lineTo(0, 0);
    graphics.endFill();

    graphics.moveTo(0, dividerTop);
    graphics.lineTo(width, dividerTop);

    graphics.moveTo(dividerLeft, dividerTop);
    graphics.lineTo(dividerLeft, height);

    const texture = graphics.generateTexture();
    graphics.destroy();

    return game.world.create((game.world.bounds.width / 2) - (width / 2) - 3, marginTop, texture);
  }

  constructor(config: Config) {
    super({
      id: config.id,
      subject: config.subject,
      game: config.game,
      sprite: UIIngame.createBase(config.game),
      children: {
        menu: UIMenu,
        inventory: UIInventory,
        stats: UIStats,
      },
    });

    this.gold = config.game.make.text(goldLeft, marginTop, '', { font: '12px Arial', fill: '#FFFFFF' });
    this.sprite.addChild(this.gold);
    const menu = this.children.menu;
    const inventory = this.children.inventory;
    const stats = this.children.stats;

    menu.sprite.y = dividerTop + nameTop; // TODO: manual adjustment! maybe handle this in the child instead?
    menu.createOptions(menuOptions);
    menu.toggle(true);

    // events
    menu.on('selecting', (response) => {
      // hide all
      inventory.hide();
      stats.hide();

      // go to submenu
      if (response.name === 'Inventory') {
        inventory.show();
      } else if (response.name === 'Stats') {
        stats.show();
      }
    });

    this.on('show', () => {
      menu.focus();
      this.gold.text = `${this.subject.gold} G`; // and update the gold
    });

    this.on('hide', () => {
      inventory.children.itemActions.hide();
      inventory.hide();
      stats.hide();
      this.subject.resetView();
    });

    this.toggle(false);

    // this.submenu = new SpriteMenu({
    //   id: 'ingame-submenu',
    //   game,
    //   subject: this.subject,
    //   parent: this.sprite,
    // });
    // this.submenu.sprite.y = dividerTop + nameTop; // TODO: manual adjustment! maybe handle this in the child instead?
    // this.submenu.createOptions(submenu);

    // this.submenu.onChange(() => {
    //   // switch the submenu
    // });
    // this.submenu.onSelecting((response) => {
    //   // hide all
    //   this.inventory.hide();
    //   this.stats.hide();

    //   // go to submenu
    //   if (response.name === 'Inventory') {
    //     this.inventory.repopulateItems();
    //     this.inventory.show();
    //   } else if (response.name === 'Stats') {
    //     this.stats.updateStats(this.subject.stats, this.subject.equipment);
    //     this.stats.show();
    //   }
    // });

    // Inventory
    // -----------------
    // this.inventory = new SpriteInventory({
    //   id: 'ingame-items',
    //   game,
    //   parent: this.sprite,
    //   subject: this.subject,
    // });
    // this.sprite.addChild(this.inventory.sprite);

    // this.stats = new SpriteStats({
    //   id: 'ingame-stats',
    //   game,
    //   parent: this.sprite,
    //   subject: this.subject,
    // });
    // this.sprite.addChild(this.stats.sprite);
  }
}

export default UIIngame;
