import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Npc, { Config } from 'src/app/chars/base/npc';

import { Dialog } from 'src/app/sprites/dialog';

interface ConfigCommoner extends Config {
  dialog: Dialog;
};

class Commoner extends Npc {
  constructor(config: ConfigCommoner) {
    super(config);

    // event setup
    // ---------------
    config.hero.listen('action', () => {
      // check if any npc is in contact
      if (this.contact && this.inMap()) {
        const dialog = this.showDialog({
          label: this.name,
          subject: config.hero,
          dialog: config.dialog,
        });

        // make sure the commoner is facing whatever hero is facing
        this.stopOppositeAnimation(config.hero.currentAnimation().name);
        this.setView(dialog.id);

        dialog.onDone(() => {
          this.doneView();
          this.contact = false;
        });
      }
    });
  }
}

export default Commoner;
