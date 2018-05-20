import Phaser from 'phaser-ce';

import MenuSprite, { Option } from 'src/app/sprites/menu';
import SpriteDialog, { Dialog } from 'src/app/sprites/dialog';

import Human from 'src/app/chars/base/human';
import Hero from 'src/app/chars/hero';
import { Item, Items } from 'src/app/chars/items';

interface Dialogs {
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
  merchant: Human;
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

class SpriteShop {
  private id: string;
  private game: Phaser.Game;
  private description: Phaser.Text;
  private menu: MenuSprite;
  private dialog: SpriteDialog;
  private items: Items;
  private selectedItem: Item;
  private merchant: Human;
  private subject: Hero;

  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // TODO: load items sprite
  }

  constructor({ id, game, subject, merchant, items, dialogs }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.subject = subject;
    this.merchant = merchant;
    this.items = items;

    var graphics = this.game.add.graphics(0, 0);

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

    graphics.moveTo(160, 40);
    graphics.lineTo(160, height);

    this.sprite = game.world.create((game.world.bounds.width / 2) - (width / 2) - 3, marginTop, graphics.generateTexture());
    graphics.destroy();

    const style = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };
    this.description = this.game.make.text(160 + 12, 40 + 8, '', style);
    this.description.lineSpacing = lineSpacing; // the default line spacing was way too big for this font size

    this.sprite.addChild(this.description);

    this.menu = new MenuSprite({
      id,
      game,
      subject: this.subject,
      parent: this.sprite,
      options: items,
    });
    this.menu.sprite.y = 48; // TODO: manual adjustment! maybe handle this in the child instead?
    this.menu.onChange(() => {
      this.updateDescription();
    });
    this.updateDescription();

    this.menu.onSelecting(() => {
      this.select(dialogs);
    });
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
      this.merchant.showDialog({
        label: this.merchant.name,
        subject: this.subject,
        dialog: dialogs.nomoney,
      });

      return;
    }

    this.dialog = this.merchant.showDialog({
      label: this.merchant.name,
      subject: this.subject,
      dialog: dialogs.confirm,
    });

    this.dialog.onDone((response) => {
      if (response === 'yes') {
        // show a thank you message, if any
        if (dialogs.thanks) {
          this.merchant.showDialog({
            label: this.merchant.name,
            subject: this.subject,
            dialog: dialogs.thanks,
          });
        }
      } else if (response === 'no') {
        if (dialogs.cancel) {
          this.merchant.showDialog({
            label: this.merchant.name,
            subject: this.subject,
            dialog: dialogs.cancel,
          });
        }
      } else {
        throw new Error(`Invalid response: ${response}.`);
      }
    });
  }

  done() {
    this.sprite.destroy();
    return null;
  }
}

export default SpriteShop;
