// TODO
// - Most of the time merchants will sit behind a desk. So the hit area should be in front of the desk. Find a way to make that happen
import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Merchant from 'src/app/chars/base/merchant';
import { getAll as getAllItems } from 'src/app/chars/items';

import SpriteShop from 'src/app/sprites/shop';

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  hero: Hero;
  map: any;
};

class MerchantBasic extends Merchant {
  constructor({ game, group, map, hero }: Config) {
    super({
      x: 0,
      y: 5,
      delimiter: 172,
      game,
      group,
      map,
      name: 'Merchant Basic',
      hero,
      shopId: 'shop-basic',
      items: getAllItems(),
      dialogs: {
        opening: {
          id: 'shop-basic-opening',
          conversations: [{
            id: '1',
            type: 'dialog',
            text: 'Welcome to Basic Shop! Looking for something in particular?'
          }]
        },
        confirm: {
          id: 'shop-confirm',
          conversations: [{
            id: 'shop-confirm-menu',
            type: 'menu',
            text: 'Are you sure you want to buy this item?',
            options: [{
              name: 'Yes',
              answer: 'yes',
            }, {
              name: 'No',
              answer: 'no',
            }],
            answers: {
              yes: [{
                id: '2',
                type: 'dialog',
                text: 'Thank you!'
              }],
              no: [],
            },
          }],
        }
      },
    });

    this.setAnimation('walk-right');
  }
}

export default MerchantBasic;
