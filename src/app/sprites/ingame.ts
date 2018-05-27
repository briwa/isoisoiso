import Phaser from 'phaser-ce';

import SpriteMenu, { Option } from 'src/app/sprites/menu';
import SpriteInventory from 'src/app/sprites/inventory';

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
  private subject: Hero;

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
    this.toggle(false);

    const style = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };

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
      // go to submenu
      if (response.name === 'Inventory') {
        this.inventory.show();
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
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.submenu.show(); // then show the submenu
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false);
      this.submenu.hide();
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
