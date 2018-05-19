// TODO
// - Most of the time merchants will sit behind a desk. So the hit area should be in front of the desk. Find a way to make that happen
import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Npc, { Config } from 'src/app/chars/base/npc';

import SpriteShop from 'src/app/sprites/shop';
import { Dialog } from 'src/app/sprites/dialog';

interface ConfigMerchant extends Config {
  items: any[]; // TODO: type this
  dialogs?: {
    opening?: Dialog;
    confirm?: Dialog;
  };
};

class Merchant extends Npc {
  constructor(config: ConfigMerchant) {
    super(config);

    const shop = new SpriteShop({
      game: config.game,
      subject: config.hero,
      items: config.items,
      dialogs: config.dialogs,
      merchant: this,
    });
    // shop.sprite.visible = false;
  }
}

export default Merchant;
