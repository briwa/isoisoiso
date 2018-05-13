// TODO:
// - get this from db next time
interface Item {
  id: string;
  name: string;
  type: string; // TODO: type this
  description: string;
  price: number;
  effects: { property: string; value: number }[];
};

interface Equippable extends Item {
  type: 'weapon' | 'armor' | 'accessory';
  consumable: false;
};

interface Consumable extends Item {
  type: 'consumable';
  consumable: true;
};

export type Items = Array<Equippable | Consumable>;

const items: Items = [{
  id: '1',
  name: 'Small Potion',
  type: 'consumable',
  consumable: true,
  description: 'Heals a small amount of health.',
  price: 100,
  effects: [{
    property: 'hp',
    value: 100
  }]
}, {
  id: '2',
  name: 'Wooden Sword',
  type: 'weapon',
  consumable: false,
  description: 'Some toy sword.',
  price: 400,
  effects: [{
    property: 'atk',
    value: 100
  }]
}, {
  id: '3',
  name: 'Wooden Armor',
  type: 'armor',
  consumable: false,
  description: 'Some toy armor.',
  price: 350,
  effects: [{
    property: 'def',
    value: 100
  }]
}];

export const get = (id: string) => {
  return items.filter(item => id === item.id)[0];
};

export const getAll = () => {
  return items;
};
