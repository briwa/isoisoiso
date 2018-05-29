import Phaser from 'phaser-ce';

import SpriteMenu, { Option } from 'src/app/sprites/menu';
import { Dialog } from 'src/app/sprites/ui/dialog';

import Merchant from 'src/app/chars/base/merchant';
import Hero from 'src/app/chars/hero';
import { Item, Items } from 'src/app/chars/items';

export interface Dialogs {
  confirm: Dialog;
  nomoney: Dialog;
  opening?: Dialog;
  cancel?: Dialog;
  thanks?: Dialog;
  ending?: Dialog;
};

interface Config {
  id: string;
  game: Phaser.Game;
  subject: Hero;
  merchant: Merchant;
  items: Items;
  dialogs?: Dialogs;
};

const width = 480;
const height = 400;
const marginTop = 12;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;
const dividerLeft = 160;
const dividerTop = 40;
const goldLeft = 440;

class SpriteShop {
  private id: string;
  private game: Phaser.Game;
  private description: Phaser.Text;
  private menu: SpriteMenu;
  private gold: Phaser.Text;
  private items: Items;
  private selectedItem: Item;
  private merchant: Merchant;
  private subject: Hero;

  public sprite: Phaser.Sprite;

  constructor({ id, game, subject, merchant, items, dialogs }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.subject = subject;
    this.merchant = merchant;
    this.items = items;

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

    graphics.moveTo(0, dividerTop);
    graphics.lineTo(width, dividerTop);

    graphics.moveTo(dividerLeft, dividerTop);
    graphics.lineTo(dividerLeft, height);

    const texture = graphics.generateTexture();
    graphics.destroy();

    this.sprite = game.world.create((game.world.bounds.width / 2) - (width / 2) - 3, marginTop, texture);
    this.toggle(false);

    const style = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };
    this.description = this.game.make.text(dividerLeft + marginLeft, dividerTop + nameTop, '', style);
    this.description.lineSpacing = lineSpacing; // the default line spacing was way too big for this font size
    this.gold = game.make.text(goldLeft, marginTop, '', style);
    this.sprite.addChild(this.gold);
    this.sprite.addChild(this.description);


    this.menu = new SpriteMenu({
      id,
      game,
      subject: this.subject,
      parent: this.sprite,
    });
    this.menu.sprite.y = dividerTop + nameTop; // TODO: manual adjustment! maybe handle this in the child instead?
    this.menu.createOptions(items);

    this.menu.onChange(() => {
      this.updateDescription();
    });
    this.menu.onSelecting(() => {
      this.select(dialogs);
    });
    this.updateDescription();
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.menu.show();
      this.gold.text = `${this.subject.gold} G`; // and update the gold
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

  updateDescription() {
    const text = [];
    const item = this.items[this.menu.selectedIndex];
    const effects = item.effects.map(effect => `${effect.property.toUpperCase()}${effect.value < 0 ? effect.value : `+${effect.value}`}`).join('\n');
    text.push(item.description); // description
    text.push(`${effects}`); // Effect
    text.push(`Price: ${item.price} G`); // price
    this.description.text = text.join('\n');
    this.selectedItem = item;
  }

  select(dialogs: Dialogs) {
    const item = this.items[this.menu.selectedIndex];

    // check if subject has enough money
    if (this.subject.gold < item.price) {
      this.merchant.dialog.start(dialogs.nomoney.conversations, true);
      return;
    }

    this.merchant.dialog.start(dialogs.confirm.conversations, true);

    this.merchant.dialog.once('done', (response) => {
      if (response === 'yes') {
        this.subject.purchaseItem(item.id);
        this.gold.text = `${this.subject.gold} G`; // and update the gold

        // show a thank you message, if any
        if (dialogs.thanks) {
          this.merchant.dialog.start(dialogs.thanks.conversations, true);
        }
      } else if (response === 'no') {
        if (dialogs.cancel) {
          this.merchant.dialog.start(dialogs.cancel.conversations, true);
        }
      } else {
        throw new Error(`Invalid response: ${response}.`);
      }
    });
  }
}

export default SpriteShop;
