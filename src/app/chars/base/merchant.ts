// TODO
// - Most of the time merchants will sit behind a desk. So the hit area should be in front of the desk. Find a way to make that happen
import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Npc, { ConfigNpc } from 'src/app/chars/base/npc';

import { Items } from 'src/app/chars/items';
import UIShop, { Dialogs } from 'src/app/sprites/ui/shop';
import UIDialog, { Dialog } from 'src/app/sprites/ui/dialog';

interface ConfigMerchant extends ConfigNpc {
  shopId: string;
  items: Items;
  dialogs?: Dialogs;
};

class Merchant extends Npc {
  private shop: UIShop;
  private subject: Hero;
  private dialogs: Dialogs;
  private items: Items;
  private id: string;

  dialog: UIDialog;

  constructor(config: ConfigMerchant) {
    super(config);

    this.id = config.shopId;
    this.subject = config.hero;
    this.dialogs = config.dialogs;
    this.items = config.items;

    this.shop = new UIShop({
      id: this.id,
      game: this.game,
      subject: this.subject,
      items: this.items,
      dialogs: this.dialogs,
      merchant: this,
    });

    this.dialog = new UIDialog({
      id: `${config.name}-dialog`,
      game: config.game,
      subject: config.hero,
      label: this.name,
    });

    // event setup
    // ---------------
    config.hero.listen('action', this.startShop, this, 'map');
    config.hero.listen('cancel', this.endShop, this);

    this.sprite.events.onDestroy.addOnce(() => {
      this.subject.removeListener('action', this.startShop, this);
      this.subject.removeListener('cancel', this.endShop, this);
    });
  }

  startShop() {
    // check if the merchant is in contact
    if (this.contact && this.subject.inMap) {
      // make sure the commoner is facing whatever hero is facing
      this.stopOppositeAnimation(this.subject.currentAnimation().name);

      if (this.dialogs.opening) {
        this.dialog.start(this.dialogs.opening.conversations, true);
        this.dialog.once('done', () => {
          this.showShop();
        });
      } else {
        this.showShop();
      }
    }
  }

  showShop() {
    this.shop.show();
    this.busy = true;
  }

  endShop() {
    this.shop.hide();

    if (this.dialogs.ending) {
      this.dialog.start(this.dialogs.ending.conversations, true);
    }

    this.busy = false;
    this.contact = false;
  }
}

export default Merchant;
