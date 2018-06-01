import Phaser from 'phaser-ce';

import UIBase, { UIConfig, UIChildren } from 'src/app/sprites/ui/base';
import Hero from 'src/app/chars/hero';

class UIToggle<C = UIChildren> extends UIBase<C> {
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
