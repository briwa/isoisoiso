import Phaser from 'phaser-ce';

import SpriteMenu, { Option } from 'src/app/sprites/menu';
import SpriteInventory from 'src/app/sprites/inventory';
import SpriteStats from 'src/app/sprites/stats';

import Human from 'src/app/chars/base/human';
import Hero from 'src/app/chars/hero';
import { Item, Items } from 'src/app/chars/items';

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

const submenu = [{
  id: '1',
  name: 'Inventory'
}, {
  id: '2',
  name: 'Stats'
}, {
  id: '3',
  name: 'Settings'
}];

class SpriteIngame {
  private id: string;
  private game: Phaser.Game;
  private submenu: SpriteMenu;
  private inventory: SpriteInventory;
  private stats: SpriteStats;
  private subject: Hero;

  private gold: Phaser.Text;

  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // TODO: load items sprite
  }

  constructor({ id, game, subject }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.subject = subject;

    const graphics = this.game.add.graphics(0, 0);

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

    graphics.moveTo(0, 40);
    graphics.lineTo(width, 40);

    graphics.moveTo(80, 40);
    graphics.lineTo(80, height);

    const texture = graphics.generateTexture();
    graphics.destroy();

    this.sprite = game.world.create((game.world.bounds.width / 2) - (width / 2) - 3, marginTop, texture);
    this.gold = game.make.text(440, 15, '', { font: '12px Arial', fill: '#FFFFFF' });
    this.sprite.addChild(this.gold);

    this.toggle(false);

    this.submenu = new SpriteMenu({
      id: 'ingame-submenu',
      game,
      subject: this.subject,
      parent: this.sprite,
    });
    this.submenu.sprite.y = 48; // TODO: manual adjustment! maybe handle this in the child instead?
    this.submenu.createOptions(submenu);

    this.submenu.onChange(() => {
      // switch the submenu
    });
    this.submenu.onSelecting((response) => {
      // hide all
      this.inventory.hide();
      this.stats.hide();

      // go to submenu
      if (response.name === 'Inventory') {
        this.inventory.show();
      } else if (response.name === 'Stats') {
        this.stats.updateStats(this.subject.stats, this.subject.equipment);
        this.stats.show();
      }
    });

    // Inventory
    // -----------------
    this.inventory = new SpriteInventory({
      id: 'ingame-items',
      game,
      parent: this.sprite,
      subject: this.subject,
    });
    this.sprite.addChild(this.inventory.sprite);

    this.stats = new SpriteStats({
      id: 'ingame-stats',
      game,
      parent: this.sprite,
      subject: this.subject,
    });
    this.sprite.addChild(this.stats.sprite);
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.submenu.show(); // then show the submenu
      this.gold.text = `${this.subject.gold} G`; // and update the gold
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false);
      this.submenu.hide();
      this.inventory.hide();
      this.stats.hide();
      this.subject.resetView();
    }
  }

  toggle(toggle) {
    this.sprite.visible = toggle;
  }

  select() {
    // woo wee
  }
}

export default SpriteIngame;
