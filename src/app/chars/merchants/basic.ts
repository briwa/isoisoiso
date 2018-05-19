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

const shapedOptions = getAllItems().map(item => ({
  id: item.id,
  price: item.price,
  name: `${item.name} - ${item.price} G`,
  answer: null,
}));

const conversations = [{
    id: '1',
    type: 'dialog',
    text: 'Get the best of the items here!',
  }, {
    id: '2',
    type: 'menu',
    onSelect: (subject, item) => {
      subject.stopOppositeAnimation();

      if (item.answer === 'no') return 'no';

      // check if can purchase
      if (subject.gold >= item.price) {
        subject.purchase(item.id);
        return 'yes';
      }

      return 'not-enough-gold';
    },
    options: shapedOptions.concat([{
      id: '-1',
      name: 'Cancel',
      price: null,
      answer: 'no',
    }]),
    answers: {
      yes: [{
        id: '6',
        type: 'dialog',
        text: 'Thanks! Come again!'
      }],
      no: [{
        id: '5',
        type: 'dialog',
        text: 'Oh well, that\'s fine, my kids don\'t need no food anyway. Bye.'
      }],
      'not-enough-gold': [{
        id: '11',
        type: 'dialog',
        text: 'Not enough money, son...'
      }],
    },
  }];

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
      conversations,
      hero,
    });

    this.setAnimation('walk-right');

    const shop = new SpriteShop({ game, hero, npc: this, items: getAllItems() });
    // shop.sprite.visible = false;
  }
}

export default MerchantBasic;
