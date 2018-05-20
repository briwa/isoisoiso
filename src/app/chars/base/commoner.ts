import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import Npc, { Config } from 'src/app/chars/base/npc';

import SpriteDialog, { Dialog } from 'src/app/sprites/dialog';

interface ConfigCommoner extends Config {
  dialog: Dialog;
};

class Commoner extends Npc {
  private dialog: SpriteDialog;

  constructor(config: ConfigCommoner) {
    super(config);

    this.dialog = this.createDialog({
      label: this.name,
      subject: config.hero,
      dialog: config.dialog,
    });

    // event setup
    // ---------------
    this.dialog.subject.listen('action', this.startDialog, this);

    // clear event on destroy
    this.sprite.events.onDestroy.addOnce(() => {
      this.dialog.subject.removeListener('action', this.startDialog, this);
    });
  }

  startDialog() {
    // check if any npc is in contact
    if (this.contact && this.inMap()) {
      this.dialog.show();

      // make sure the commoner is facing whatever subject is facing
      this.stopOppositeAnimation(this.dialog.subject.currentAnimation().name);
      this.setView(this.dialog.id);

      this.dialog.onDone(() => {
        this.dialog.hide()
        this.doneView();
        this.contact = false;
      });
    }
  }
}

export default Commoner;
