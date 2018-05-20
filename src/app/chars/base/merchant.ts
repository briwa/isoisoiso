// TODO
// - Most of the time merchants will sit behind a desk. So the hit area should be in front of the desk. Find a way to make that happen
import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Npc, { Config } from 'src/app/chars/base/npc';

import { Items } from 'src/app/chars/items';
import SpriteShop, { Dialogs } from 'src/app/sprites/shop';
import SpriteDialog, { Dialog } from 'src/app/sprites/dialog';

interface ConfigMerchant extends Config {
  shopId: string;
  items: Items;
  dialogs?: Dialogs;
};

class Merchant extends Npc {
  private shop: SpriteShop;
  private subject: Hero;
  private dialogs: Dialogs;
  private items: Items;
  private shopId: string;

  constructor(config: ConfigMerchant) {
    super(config);

    this.shopId = config.shopId;
    this.subject = config.hero;
    this.dialogs = config.dialogs;
    this.items = config.items;

    this.shop = new SpriteShop({
      id: this.shopId,
      game: this.game,
      subject: this.subject,
      items: this.items,
      dialogs: this.dialogs,
      merchant: this,
    });

    // event setup
    // ---------------
    config.hero.listen('action', this.startShop, this);
    config.hero.listen('cancel', this.endShop, this);

    this.sprite.events.onDestroy.addOnce(() => {
      this.subject.removeListener('action', this.startShop, this);
      this.subject.removeListener('cancel', this.endShop, this);
    });
  }

  startShop() {
    // check if the merchant is in contact
    if (this.contact && this.subject.inMap()) {
      // make sure the commoner is facing whatever hero is facing
      this.stopOppositeAnimation(this.subject.currentAnimation().name);

      if (this.dialogs.opening) {
        const opening = this.createDialog({
          label: this.name,
          subject: this.subject,
          dialog: this.dialogs.opening,
          immediate: true,
        });

        opening.onDone(() => {
          this.showShop();
        });
      } else {
        this.showShop();
      }
    }
  }

  endShop() {
    if (this.subject.getView() === this.shopId) {
      this.shop.hide();

      this.doneView();
      this.contact = false;

      if (this.dialogs.ending) {
        this.createDialog({
          label: this.name,
          subject: this.subject,
          dialog: this.dialogs.ending,
          immediate: true,
        });
      }
    }
  }

  showShop() {
    this.shop.show();
    this.setView(this.shopId);
  }
}

export default Merchant;
