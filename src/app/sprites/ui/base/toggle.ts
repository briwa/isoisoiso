import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui/base';
import Hero from 'src/app/chars/hero';

interface UIConfig {
  id: string;
  subject: any;
  game: Phaser.Game;
  sprite?: Phaser.Sprite;
  parent?: UIBase;
  children?: any;
};

class UIToggle extends UIBase {
  constructor(config: UIConfig) {
    super(config);

    // toggleable elements need to be initially hidden
    this.toggle(false);
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.subject.view = this.id;

      this.emit('show');
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false)
      this.subject.doneView();

      this.emit('hide');
    }
  }
}

export default UIToggle;
