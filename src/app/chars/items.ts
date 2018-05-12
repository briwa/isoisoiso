// TODO:
// - get this from db next time

const items = [{
  id: '1',
  name: 'Small Potion',
  type: 'consumable',
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
  description: 'Some toy armor.',
  price: 350,
  effects: [{
    property: 'def',
    value: 100
  }]
}];

export const get = (id: string) => {
  return items.filter(item => item.id)[0];
};

export const getAll = () => {
  return items;
};