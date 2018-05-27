import Phaser from 'phaser-ce';

import SpriteMenu, { Option } from 'src/app/sprites/menu';
import SpriteOptions from 'src/app/sprites/options';

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
  private actionOptions: SpriteOptions;

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
    this.items.onSelecting((response) => {
      // go to submenu
      this.actionOptions.createOptions(
        response.bounds.x,
        response.bounds.y,
        [{
          id: '1',
          text: 'Use'
        }, {
          id: '2',
          text: 'Discard'
        }]
      );

      this.actionOptions.show();
    });
    this.items.onCancel(() => {
      // go back to the previous menu
      this.hide();
    });

    this.actionOptions = new SpriteOptions({
      id : 'ingame-options',
      game,
      subject,
      parent,
    });
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.items.show();
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false);
      this.items.hide();
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
