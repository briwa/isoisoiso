// TODO
// - Most of the time merchants will sit behind a desk. So the hit area should be in front of the desk. Find a way to make that happen
import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Merchant from 'src/app/chars/base/merchant';
import { getAll as getAllItems } from 'src/app/chars/items';

import UIShop from 'src/app/sprites/ui/shop';

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
      initFrame: 'right',
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
          id: 'shop-basic-confirm',
          conversations: [{
            id: 'shop-basic-confirm-menu',
            type: 'menu',
            text: 'Are you sure you want to buy this item?',
            options: [{
              name: 'Buy this item',
              answer: 'yes',
            }, {
              name: 'Cancel',
              answer: 'no',
            }],
          }],
        },
        nomoney: {
          id: 'shop-basic-nomoney',
          conversations: [{
            id: '1',
            type: 'dialog',
            text: 'You don\'t have sufficient funds.'
          }]
        },
        thanks: {
          id: 'shop-basic-thanks',
          conversations: [{
            id: '1',
            type: 'dialog',
            text: 'Thank you!'
          }]
        },
        ending: {
          id: 'shop-basic-ending',
          conversations: [{
            id: '1',
            type: 'dialog',
            text: 'Come again!'
          }]
        },
      },
    });
  }
}

export default MerchantBasic;
