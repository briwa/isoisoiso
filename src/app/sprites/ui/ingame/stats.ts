import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui/base';
import Hero from 'src/app/chars/hero';

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
const dividerLeft = 80;
const dividerTop = 50;

class UIStats extends UIBase {
  private game:  Phaser.Game;
  private statsLayer: Phaser.Sprite;
  private equipmentLayer: Phaser.Sprite;

  constructor(config: Config) {
    super({
      id: config.id,
      subject: config.subject,
      game: config.game,
      parent: config.parent,
    });

    this.game = config.game;
    this.sprite.x = dividerLeft;
    this.sprite.y = dividerTop;
    this.statsLayer = config.game.make.sprite(0, 0);
    this.equipmentLayer = config.game.make.sprite(0, dividerTop);
    this.sprite.addChild(this.statsLayer);
    this.sprite.addChild(this.equipmentLayer);

    this.on('show', () => {
      this.updateStats(this.subject.stats, this.subject.equipment);
    });

    this.subject.listen('cancel', this.hide, this);
    this.sprite.events.onDestroy.addOnce(() => {
      // remove subject listeners
      this.subject.removeListener('cancel', this.hide, this);
    });

    this.toggle(false);
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
}

export default UIStats;
