import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import Npc, { Config } from 'src/app/chars/base/npc';

import { Dialog } from 'src/app/sprites/dialog';

interface ConfigCommoner extends Config {
  dialog: Dialog;
};

class Commoner extends Npc {
  private subject: Human;
  private dialog: Dialog;
  constructor(config: ConfigCommoner) {
    super(config);

    this.subject = config.hero;
    this.dialog = config.dialog;

    // event setup
    // ---------------
    this.subject.listen('action', this.startDialog, this);

    // clear event on destroy
    this.sprite.events.onDestroy.addOnce(() => {
      this.subject.removeListener('action', this.startDialog, this);
    });
  }

  startDialog() {
    // check if any npc is in contact
    if (this.contact && this.inMap()) {
      const dialog = this.showDialog({
        label: this.name,
        subject: this.subject,
        dialog: this.dialog,
      });

      // make sure the commoner is facing whatever subject is facing
      this.stopOppositeAnimation(this.subject.currentAnimation().name);
      this.setView(dialog.id);

      dialog.onDone(() => {
        this.doneView();
        this.contact = false;
      });
    }
  }
}

export default Commoner;
