import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Npc from 'src/app/chars/base/npc';

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  hero: Hero;
  map: any;
};

class SomeDude extends Npc {
  constructor({ game, group, map, hero }: Config) {
    super({
      x: 3,
      y: 3,
      delimiter: 129,
      game,
      group,
      map,
      movement: {
        type: 'track',
        input: [[7,3], [3,3]],
      },
      name: 'Some Dude',
      conversations: [{
        id: 1,
        type: 'dialog',
        text: 'Long time no see, chap. How are you?',
      }, {
        id: 2,
        type: 'dialog',
        text: 'Was wondering if you could help me with something?',
      }, {
        id: 3,
        type: 'menu',
        text: 'Choose an option...',
        options: [{
          text: 'Sure, what is it?',
          nextId: 5,
        }, {
          text: 'Aw maybe next time...',
          nextId: 4,
        }],
      }, {
        id: 4,
        type: 'conversation',
        conversations: [{
          id: 6,
          type: 'dialog',
          text: 'Fine, next time it is!'
        }],
      }, {
        id: 5,
        type: 'conversation',
        conversations: [{
          id: 7,
          type: 'dialog',
          text: 'Ok so can you get lost? Thanks.'
        }],
      }],
      hero,
    });
  }
}

export default SomeDude;
