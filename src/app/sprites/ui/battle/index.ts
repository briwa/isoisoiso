import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui/base';
import UIMenuToggle from 'src/app/sprites/ui/menu-toggle';

import Human from 'src/app/chars/base/human';
import Npc from 'src/app/chars/base/npc';
import Hero from 'src/app/chars/hero';

// TODO: for now
import SomeDude from 'src/app/chars/commoners/some-dude';

interface Children {
  actions: UIMenuToggle;
};

interface Config {
  id: string;
  game: Phaser.Game;
  subject: Hero;
  enemies: any[];
  heroes: Hero[];
  map: any;
};

const width = 480;
const height = 100;
const marginTop = 12;
const marginLeft = 12;
const marginBottom = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;
const dividerLeft = 80;
const dividerTop = 40;
const goldLeft = 440;

const actions = [{
  id: '1',
  name: 'Attack',
}, {
  id: '2',
  name: 'Skills',
}, {
  id: '3',
  name: 'Items',
}, {
  id: '4',
  name: 'Run',
}];

class UIBattle extends UIBase<Children> {
  private enemies = [];
  private actions;
  private chars;
  private targetSelector;

  private actionLayer: Phaser.Sprite;

  public sprite: Phaser.Sprite;

  static createSprite(game: Phaser.Game): Phaser.Sprite {
    // UI
    const graphics = game.add.graphics(0, 0);
    graphics.beginFill(0x333333);
    graphics.lineStyle(3, 0xdddddd, 1);
    graphics.moveTo(0,0);
    graphics.lineTo(width, 0);
    graphics.lineTo(width, height);
    graphics.lineTo(0, height);
    graphics.lineTo(0, 0);
    graphics.endFill();

    const texture = graphics.generateTexture();
    graphics.destroy();

    return game.world.create(
      (game.world.bounds.width / 2) - (width / 2) - 3,
      game.world.bounds.height - height - marginBottom,
      texture
    );
  }

  constructor(config: Config) {
    super({
      id: config.id,
      subject: config.subject,
      game: config.game,
      sprite: UIBattle.createSprite(config.game),
      children: {
        actions: UIMenuToggle,
      },
    });

    // place characters
    const base = 2
    config.enemies.forEach((num) => {
      this.enemies.push(new SomeDude({
        x: base,
        y: num,
        game: config.game,
        map: config.map,
        hero: this.subject,
        group: config.map.group,
        initFrame: 'right',
      }));
    });

    this.actionLayer = config.game.make.sprite(marginTop, marginLeft);
    this.sprite.addChild(this.actionLayer);

    this.children.actions.createOptions(actions);
    this.children.actions.show();
  }
}

export default UIBattle;
