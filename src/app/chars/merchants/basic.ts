import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Npc from 'src/app/chars/base/npc';

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  hero: Hero;
  map: any;
};

const items = [{
  id: 1,
  name: 'Small Potion',
  type: 'consumable',
  description: 'Heals a small amount of health.',
  price: 100,
  effects: [{
    property: 'hp',
    value: 100
  }]
}, {
  id: 2,
  name: 'Wooden Sword',
  type: 'weapon',
  description: 'Some toy sword.',
  price: 400,
  effects: [{
    property: 'atk',
    value: 100
  }]
}, {
  id: 2,
  name: 'Wooden Armor',
  type: 'armor',
  description: 'Some toy armor.',
  price: 350,
  effects: [{
    property: 'def',
    value: 100
  }]
}];

const shapedOptions = items.map(item => ({
  id: item.id,
  name: item.name,
  nextId: 4,
}));

const conversations = [{
  id: 1,
  type: 'dialog',
  text: 'Get the best of the items here!',
}, {
  id: 2,
  type: 'menu',
  options: shapedOptions.concat([{
    id: -1,
    name: 'Cancel',
    nextId: 3,
  }]),
}, {
  id: 3,
  type: 'conversations',
  conversations: [{
    id: 5,
    type: 'dialog',
    text: 'Oh well, that\'s fine, my kids don\'t need no food anyway. Bye.'
  }],
}, {
  id: 4,
  type: 'conversations',
  conversations: [{
    id: 6,
    type: 'dialog',
    text: 'Thanks! Come again!'
  }],
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
  }
}

export default MerchantBasic;
