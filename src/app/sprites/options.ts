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
  parent: Phaser.Sprite;
};

const width = 100;
const lineHeight = 12;
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

class SpriteOptions {
  private id: string;
  private game: Phaser.Game;
  private subject: Hero;

  // layers
  private bgLayer: Phaser.Sprite;
  private menuLayer: Phaser.Sprite;

  public sprite: Phaser.Sprite;
  public context: any;
  public menu: SpriteMenu;

  constructor({ id, game, subject, parent }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.subject = subject;

    this.sprite = this.game.make.sprite(0, 0);
    this.bgLayer = this.game.make.sprite(0, 0);
    this.menuLayer = this.game.make.sprite(0, 0);

    this.sprite.addChild(this.bgLayer);
    this.sprite.addChild(this.menuLayer);
    parent.addChild(this.sprite);
    this.toggle(false);

    this.menu = new SpriteMenu({
      id,
      game,
      subject: this.subject,
      parent: this.menuLayer,
    });
  }

  setActions(item) {
    // cleanup
    if (this.bgLayer.children[0]) {
      (this.bgLayer.children[0] as any).destroy();
    }

    this.context = item;
    const options = [];
    const x = item.x + item.width;
    const y = item.y + item.height;

    if (item.consumable) {
      options.push({ name : 'Use' }, { name : 'Discard' });
    } else {
      if (item.equipped) {
        options.push({ name : 'Unequip' });
      } else {
        options.push({ name : 'Equip' }, { name : 'Discard' });
      }
    }

    const height = (options.length + 1) * lineHeight;
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

    const texture = graphics.generateTexture();
    graphics.destroy();

    const bg = this.game.make.sprite(0, 0, texture);
    this.bgLayer.addChild(bg);
    this.bgLayer.x = x;
    this.bgLayer.y = y;

    this.menu.createOptions(options);
    this.menuLayer.x = x;
    this.menuLayer.y = y;
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.menu.show();
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false);
      this.menu.hide();
    }
  }

  toggle(toggle) {
    this.sprite.visible = toggle;
  }

  select() {
    // woo wee
  }
}

export default SpriteOptions;
