import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import Hero from 'src/app/chars/hero';

interface Config {
  id: string;
  game: Phaser.Game;
  subject: Hero;
};

const width = 480;
const height = 400;
const marginTop = 12;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;
const dividerLeft = 80;
const dividerTop = 40;
const goldLeft = 440;

const submenu = [{
  id: '1',
  name: 'Attack'
}, {
  id: '2',
  name: 'Skills'
}, {
  id: '3',
  name: 'Items'
}, {
  id: '4',
  name: 'Run away'
}];

class SpriteBattleActions {
  private id: string;
  private game: Phaser.Game;
  private actions;
  private targetSelector;
  private subject: Hero;

  public sprite: Phaser.Sprite;

  constructor({ id, game, subject }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.subject = subject;

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
  }
}

export default SpriteBattleActions;
