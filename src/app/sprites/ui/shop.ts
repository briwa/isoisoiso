import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui';
import UIMenu from 'src/app/sprites/ui/menu';
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

class UIShop extends UIBase {
  private description: Phaser.Text;
  private gold: Phaser.Text;
  private items: Items;
  private selectedItem: Item;
  private merchant: Merchant;
  private hero: Hero;

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
      game: config.game,
      subject: config.subject,
      sprite: UIShop.createBase(config.game),
      children: {
        menu: UIMenu,
      },
    });

    // setup
    this.merchant = config.merchant;
    this.items = config.items;
    this.hero = config.subject;


    // gold and description styling
    const style = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };
    this.description = config.game.make.text(dividerLeft + marginLeft, dividerTop + nameTop, '', style);
    this.description.lineSpacing = lineSpacing; // the default line spacing was way too big for this font size
    this.gold = config.game.make.text(goldLeft, marginTop, '', style);
    this.sprite.addChild(this.gold);
    this.sprite.addChild(this.description);
    this.updateDescription();

    // menu setup
    this.children.menu.sprite.y = dividerTop + nameTop;
    this.children.menu.createOptions(config.items);
    this.children.menu.toggle(true);
    this.on('show', () => {
      this.children.menu.selectIndex(0); // reset selection to top
      this.gold.text = `${this.hero.gold} G`; // and update the gold
    });
    this.children.menu.on('selection', () => {
      this.updateDescription();
    });
    this.children.menu.on('selecting', () => {
      this.select(config.dialogs);
    });

    this.toggle(false);
  }

  updateDescription() {
    const text = [];
    const item = this.items[this.children.menu.selectedIndex];
    const effects = item.effects.map(effect => `${effect.property.toUpperCase()}${effect.value < 0 ? effect.value : `+${effect.value}`}`).join('\n');
    text.push(item.description); // description
    text.push(`${effects}`); // Effect
    text.push(`Price: ${item.price} G`); // price
    this.description.text = text.join('\n');
    this.selectedItem = item;
  }

  select(dialogs: Dialogs) {
    const item = this.items[this.children.menu.selectedIndex];

    // check if subject has enough money
    if (this.hero.gold < item.price) {
      this.merchant.dialog.start(dialogs.nomoney.conversations, true);
      return;
    }

    this.merchant.dialog.start(dialogs.confirm.conversations, true);

    this.merchant.dialog.once('done', (response) => {
      if (response === 'yes') {
        this.hero.purchaseItem(item.id);
        this.gold.text = `${this.hero.gold} G`; // and update the gold

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

export default UIShop;
