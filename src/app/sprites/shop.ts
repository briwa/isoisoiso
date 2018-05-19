import Phaser from 'phaser-ce';

import MenuSprite, { Option } from 'src/app/sprites/menu';

import Npc from 'src/app/chars/base/npc';
import Hero from 'src/app/chars/hero';
import { Items } from 'src/app/chars/items';

interface Config {
  game: Phaser.Game;
  hero: Hero;
  npc: Npc;
  items: Items;
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
  private npc: Npc;
  private hero: Hero;

  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // TODO: load items sprite
  }

  constructor({ game, hero, npc, items }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.game = game;
    this.hero = hero;
    this.npc = npc;
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
      subject: hero,
      parent: this.sprite,
      options: items,
    });
    this.menu.sprite.y = 48; // TODO: manual adjustment! maybe handle this in the child instead?
    this.menu.onChange(() => {
      this.updateDescription();
    });
    this.updateDescription();

    this.menu.onSelecting(() => {
      this.onSelect();
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

  onSelect() {
    const item = this.items[this.menu.selectedIndex];
    this.menu.toggle(false);

    this.dialog = this.npc.showDialog({
      name: 'shop-confirm',
      hero: this.hero,
      npc: this.npc,
      conversations: [{
        id: 'shop-confirm-menu',
        type: 'menu',
        text: 'Are you sure you want to buy this item?',
        onSelect: (subject, option) => {
          this.menu.toggle(true);
          return option.answer;
        },
        options: [{
          name: 'Yes',
          answer: 'yes',
        }, {
          name: 'No',
          answer: 'no',
        }],
        answers: {
          yes: [{
            id: '2',
            type: 'dialog',
            text: 'Thank you!'
          }],
          no: [],
        },
      }],
    });
  }
}

export default SpriteShop;
