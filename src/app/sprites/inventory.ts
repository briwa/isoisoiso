import Phaser from 'phaser-ce';

import SpriteMenu, { Option } from 'src/app/sprites/menu';

import Human from 'src/app/chars/base/human';
import Hero from 'src/app/chars/hero';
import { Item, Items } from 'src/app/chars/items';

interface Config {
  id: string;
  game: Phaser.Game;
  parent: Phaser.Sprite;
  subject: Hero;
};

const width = 480;
const height = 400;
const marginTop = 12;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;

class SpriteInventory {
  private id: string;
  private game: Phaser.Game;
  private parent: Phaser.Sprite;
  private items: SpriteMenu;
  private subject: Hero;

  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // TODO: load items sprite
  }

  constructor({ id, game, parent, subject }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.subject = subject;
    this.parent = parent;

    // const graphics = this.game.add.graphics(0, 0);

    // // set a fill and line style
    // graphics.beginFill(0x333333);
    // graphics.lineStyle(3, 0xdddddd, 1);

    // // draw a shape
    // graphics.moveTo(0,0);
    // graphics.lineTo(width, 0);
    // graphics.lineTo(width, height);
    // graphics.lineTo(0, height);
    // graphics.lineTo(0, 0);
    // graphics.endFill();

    // graphics.moveTo(0, 40);
    // graphics.lineTo(width, 40);

    // graphics.moveTo(80, 40);
    // graphics.lineTo(80, height);

    // const texture = graphics.generateTexture();
    // graphics.destroy();

    this.sprite = game.make.sprite(80, 50);
    this.parent.addChild(this.sprite);
    this.toggle(false);

    const style = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };

    this.items = new SpriteMenu({
      game,
      subject: this.subject,
      parent: this.sprite,
    });
    this.items.createOptions(id, this.subject.inventory);

    this.items.onChange(() => {
      // switch the submenu
    });
    this.items.onSelecting(() => {
      // go to submenu
    });
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.items.show();
      this.subject.setView(this.id);
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false);
      this.items.hide();
      this.subject.doneView();
    }
  }

  toggle(toggle) {
    this.sprite.visible = toggle;
  }

  select() {
    // woo wee
  }
}

export default SpriteInventory;
