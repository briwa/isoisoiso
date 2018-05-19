// TODO
// - Most of the time merchants will sit behind a desk. So the hit area should be in front of the desk. Find a way to make that happen
import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Npc from 'src/app/chars/base/npc';

import { getAll as getAllItems } from 'src/app/chars/items';

import SpriteShop from 'src/app/sprites/shop';

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  hero: Hero;
  map: any;
};

class MerchantBasic extends Npc {
  constructor({ game, group, map, hero }: Config) {
    super({
      x: 0,
      y: 5,
      delimiter: 172,
      game,
      group,
      map,
      name: 'Merchant',
      dialog: {
        id: 'merchant-generic',
        conversations: [],
      },
      hero,
    });

    this.setAnimation('walk-right');

    const shop = new SpriteShop({ game, hero, npc: this, items: getAllItems() });
    // shop.sprite.visible = false;
  }
}

export default MerchantBasic;
