import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui/base';
import UIToggle from 'src/app/sprites/ui/base/toggle';
import UIMenu from 'src/app/sprites/ui/menu';

import Hero from 'src/app/chars/hero';

interface Config {
  id: string;
  game: Phaser.Game;
  subject: Hero;
  parent: UIBase;
};

interface Children {
  menu: UIMenu;
};

const width = 100;
const lineHeight = 12;
const marginTop = 12;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;

class UIActions extends UIToggle<Children> {
  private game: Phaser.Game;
  private bgLayer: Phaser.Sprite;

  context: any;

  constructor(config: Config) {
    super({
      id: config.id,
      subject: config.subject,
      game: config.game,
      parent: config.parent,
      children: {
        menu: UIMenu,
      },
    });

    // setup
    this.game = config.game;
    this.bgLayer = this.game.make.sprite(0, 0);
    this.sprite.addChildAt(this.bgLayer, 0); // always put bg at the very first layer
  }

  setActions(item) {
    // cleanup
    if (this.bgLayer.children[0]) {
      (this.bgLayer.children[0] as any).destroy();
    }

    this.context = item;
    const options = [];
    const x = item.x + item.width;
    const y = item.y + item.height;

    if (item.consumable) {
      options.push({ name : 'Use' }, { name : 'Discard' });
    } else {
      if (item.equipped) {
        options.push({ name : 'Unequip' });
      } else {
        options.push({ name : 'Equip' }, { name : 'Discard' });
      }
    }

    const height = (options.length + 1) * lineHeight;
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

    const texture = graphics.generateTexture();
    graphics.destroy();

    const bg = this.game.make.sprite(0, 0, texture);
    this.bgLayer.addChild(bg);
    this.bgLayer.x = x;
    this.bgLayer.y = y;

    this.children.menu.createOptions(options);
    this.children.menu.sprite.x = x;
    this.children.menu.sprite.y = y;
  }
}

export default UIActions;
