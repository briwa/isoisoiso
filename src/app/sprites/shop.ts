import Phaser from 'phaser-ce';

import MenuSprite, { Option } from 'src/app/sprites/menu';
import { Dialog } from 'src/app/sprites/dialog';

import Human from 'src/app/chars/base/human';
import { Items } from 'src/app/chars/items';

interface Dialogs {
  opening?: Dialog;
  confirm?: Dialog;
};

interface Config {
  game: Phaser.Game;
  subject: Human;
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
  private game: Phaser.Game;
  private description: Phaser.Text;
  private menu: MenuSprite;
  private dialog: any;
  private items: Items;
  private merchant: Human;
  private subject: Human;

  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // TODO: load items sprite
  }

  constructor({ game, subject, merchant, items, dialogs }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
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
      id: 'shop-selection',
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
      this.onSelect(dialogs);
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
  }

  onSelect(dialogs: Dialogs) {
    const item = this.items[this.menu.selectedIndex];

    this.dialog = this.merchant.showDialog({
      hero: (this.subject as any),
      npc: (this.merchant as any),
      dialog: dialogs.confirm,
    });
  }
}

export default SpriteShop;
