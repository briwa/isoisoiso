import Phaser from 'phaser-ce';

import SpriteActions from 'src/app/sprites/battle/actions';

import Human from 'src/app/chars/base/human';
import Npc from 'src/app/chars/base/npc';
import Hero from 'src/app/chars/hero';

// TODO: for now
import SomeDude from 'src/app/chars/commoners/some-dude';

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

class SpriteBattle {
  private id: string;
  private game: Phaser.Game;
  private subject: Hero;
  private enemies = [];
  private actions: SpriteActions;
  private chars;
  private targetSelector;

  private actionLayer: Phaser.Sprite;

  public sprite: Phaser.Sprite;

  constructor({ id, game, subject, enemies, heroes, map }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.subject = subject;

    // place characters
    const base = 2
    enemies.forEach((num) => {
      this.enemies.push(new SomeDude({
        x: base,
        y: num,
        game,
        map,
        hero: this.subject,
        group: map.group,
        initFrame: 'right',
      }));
    });

    // UI
    const graphics = this.game.add.graphics(0, 0);
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

    this.sprite = game.world.create((game.world.bounds.width / 2) - (width / 2) - 3, game.world.bounds.height - height - marginBottom, texture);
    this.actionLayer = game.make.sprite(marginTop, marginLeft);
    this.sprite.addChild(this.actionLayer);

    this.actions = new SpriteActions({
      id: 'battle-actions',
      game,
      subject,
      parent: this.actionLayer,
    });
    this.actions.show();
  }
}

export default SpriteBattle;
