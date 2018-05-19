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
      if (this.contact && !this.paused) {
        this.showDialog({
          hero: config.hero,
          dialog: config.dialog,
          npc: this,
        });
        this.stopOppositeAnimation(config.hero.currentAnimation().name);
      }
    });
  }
}

export default Commoner;
