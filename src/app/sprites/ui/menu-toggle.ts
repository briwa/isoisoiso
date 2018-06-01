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

const width = 300;
const lineHeight = 12;
const marginTop = 12;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;

class UIMenuToggle extends UIToggle {
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

    // bubble up the event
    // TODO: find a better way to do this
    this.children.menu.on('selection', () => this.emit('selection'));
    this.children.menu.on('selecting', (response) => this.emit('selecting', response));
    this.children.menu.on('cancel', () => this.emit('cancel'));
  }

  createOptions(options) {
    this.children.menu.createOptions(options);
  }
}

export default UIMenuToggle;
