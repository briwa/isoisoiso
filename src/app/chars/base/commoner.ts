import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import Npc, { Config } from 'src/app/chars/base/npc';

import SpriteDialog, { Dialog } from 'src/app/sprites/dialog';

interface ConfigCommoner extends Config {
  dialog: Dialog;
};

class Commoner extends Npc {
  private subject: Human;
  private dialog: SpriteDialog;

  constructor(config: ConfigCommoner) {
    super(config);

    this.subject = config.hero;
    this.dialog = this.createDialog({
      label: this.name,
      subject: config.hero,
      dialog: config.dialog,
    });

    // event setup
    // ---------------
    this.dialog.subject.listen('action', this.startDialog, this, 'map');

    // clear event on destroy
    this.sprite.events.onDestroy.addOnce(() => {
      this.dialog.subject.removeListener('action', this.startDialog, this);
    });
  }

  startDialog() {
    // check if any npc is in contact
    if (this.contact && this.subject.inMap) {
      this.dialog.show();

      // make sure the commoner is facing whatever subject is facing
      this.stopOppositeAnimation(this.dialog.subject.currentAnimation().name);
      this.view = this.dialog.id;

      this.dialog.onDone(() => {
        this.dialog.hide()
        this.doneView();
        this.contact = false;
      });
    }
  }
}

export default Commoner;
