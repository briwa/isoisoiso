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
const lineHeight = 12;
const marginTop = 12;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;

class SpriteStats {
  private id: string;
  private game: Phaser.Game;
  private parent: Phaser.Sprite;
  private items: SpriteMenu;
  private subject: Hero;

  private statsLayer: Phaser.Sprite;
  private equipmentLayer: Phaser.Sprite;
  private action: SpriteOptions;

  public sprite: Phaser.Sprite;

  constructor({ id, game, parent, subject }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.subject = subject;
    this.parent = parent;

    this.sprite = game.make.sprite(80, 50);
    this.statsLayer = game.make.sprite(0, 0);
    this.equipmentLayer = game.make.sprite(0, 50);
    this.sprite.addChild(this.statsLayer);
    this.sprite.addChild(this.equipmentLayer);

    this.parent.addChild(this.sprite);
    this.toggle(false);

    this.subject.listen('cancel', this.hide, this);
    this.sprite.events.onDestroy.addOnce(() => {
      // remove subject listeners
      this.subject.removeListener('cancel', this.hide, this);
    });
  }

  updateStats(stats, equipment) {
    while (this.statsLayer.children.length) {
      const text: any = this.statsLayer.children[0];
      this.statsLayer.removeChild(text)
      text.destroy();
    }

    while (this.equipmentLayer.children.length) {
      const text: any = this.equipmentLayer.children[0];
      this.statsLayer.removeChild(text)
      text.destroy();
    }

    const optionStyle = { font: '12px Arial', fill: '#FFFFFF' };
    Object.keys(stats).forEach((stat, idx) => {
      const extra = stats[stat].extra > 0 ? `+ ${stats[stat].extra}` : '';
      const value = ['mp', 'hp'].indexOf(stat) >= 0 ?
        `${stats[stat].battle}/${stats[stat].base} ${extra}` :
        `${stats[stat].base} ${extra}`;

      const text = this.game.make.text(
        marginLeft,
        (idx * lineHeight),
        `${stat.toUpperCase()}: ${value}`,
        optionStyle,
      );

      this.statsLayer.addChild(text);
    });

    Object.keys(equipment).forEach((equip, idx) => {
      const text = this.game.make.text(
        marginLeft,
        (idx * lineHeight),
        `${equip.toUpperCase()}: ${equipment[equip] ? equipment[equip].name : ''}`,
        optionStyle,
      );

      this.equipmentLayer.addChild(text);
    });
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.subject.view = this.id;
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false);
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

export default SpriteStats;
