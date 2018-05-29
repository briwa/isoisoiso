import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import Npc, { Config } from 'src/app/chars/base/npc';

import UIDialog, { Dialog } from 'src/app/sprites/ui/dialog';

interface ConfigCommoner extends Config {
  dialog: Dialog;
};

class Commoner extends Npc {
  private subject: Human;
  private dialog: UIDialog;

  constructor(config: ConfigCommoner) {
    super(config);

    this.subject = config.hero;
    this.dialog = new UIDialog({
      id: `${config.name}-dialog`,
      game: config.game,
      subject: config.hero,
      dialog: config.dialog,
      label: this.name,
    });

    this.subject = config.hero;

    // event setup
    // ---------------
    this.subject.listen('action', this.startDialog, this, 'map');

    // clear event on destroy
    this.sprite.events.onDestroy.addOnce(() => {
      this.subject.removeListener('action', this.startDialog, this);
    });
  }

  startDialog() {
    // check if any npc is in contact
    if (this.contact && this.subject.inMap) {
      this.dialog.startConvo();
      this.dialog.show();

      // make sure the commoner is facing whatever subject is facing
      this.stopOppositeAnimation(this.subject.currentAnimation().name);
      this.busy = true;

      this.dialog.on('done', () => {
        this.dialog.hide()
        this.busy = false;
        this.contact = false;
      });
    }
  }
}

export default Commoner;
