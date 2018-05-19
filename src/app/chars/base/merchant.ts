// TODO
// - Most of the time merchants will sit behind a desk. So the hit area should be in front of the desk. Find a way to make that happen
import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Npc, { Config } from 'src/app/chars/base/npc';

import SpriteShop from 'src/app/sprites/shop';
import { Dialog } from 'src/app/sprites/dialog';

interface ConfigMerchant extends Config {
  shopId: string;
  items: any[]; // TODO: type this
  dialogs?: {
    opening?: Dialog;
    confirm?: Dialog;
    cancel?: Dialog;
    thanks?: Dialog;
    ending?: Dialog;
  };
};

class Merchant extends Npc {
  private shop: SpriteShop;

  constructor(config: ConfigMerchant) {
    super(config);

    // event setup
    // ---------------
    config.hero.listen('action', () => {
      // check if the merchant is in contact
      if (this.contact && config.hero.inMap()) {
        // make sure the commoner is facing whatever hero is facing
        this.stopOppositeAnimation(config.hero.currentAnimation().name);

        if (config.dialogs.opening) {
          const opening = this.showDialog({
            label: this.name,
            subject: config.hero,
            dialog: config.dialogs.opening,
          });

          opening.onDone(() => {
            this.showShop(config);
          });
        } else {
          this.showShop(config);
        }
      }
    });

    config.hero.listen('cancel', () => {
      if (this.shop) {
        this.hideShop(config);
      }
    });
  }

  showShop(config) {
    this.shop = new SpriteShop({
      id: config.shopId,
      game: config.game,
      subject: config.hero,
      items: config.items,
      dialogs: config.dialogs,
      merchant: this,
    });

    this.setView(config.shopId);
  }

  hideShop(config) {
    this.shop = this.shop.done();

    config.hero.doneView();
    this.doneView();
    this.contact = false;
  }
}

export default Merchant;
