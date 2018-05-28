import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import Commoner from 'src/app/chars/base/commoner';

interface Config {
  x?: number;
  y?: number;
  game: Phaser.Game;
  group: Phaser.Group;
  hero: Hero;
  map: any;
  initFrame?: string;
};

const conversations = [{
  id: '1',
  type: 'dialog',
  text: 'Long time no see, chap. How are you?',
}, {
  id: '2',
  type: 'dialog',
  text: 'Was wondering if you could help me with something?',
}, {
  id: '3',
  type: 'menu',
  text: 'Choose an option...',
  options: [{
    name: 'Sure, what is it?',
    answer: 'yes',
  }, {
    name: 'Sorry, kinda busy...',
    answer: 'no',
  }],
  answers: {
    no: [{
      id: '6',
      type: 'dialog',
      text: 'Fine, next time it is!',
    }],
    yes: [{
      id: '7',
      type: 'dialog',
      text: 'You know what, I forgot what I wanted to ask you.',
    }],
  },
}];

class SomeDude extends Commoner {
  constructor({ game, group, map, hero, x, y, initFrame }: Config) {
    super({
      x: x || 3,
      y: y || 3,
      delimiter: 129,
      game,
      group,
      map,
      movement: {
        type: 'track',
        input: [[7,3], [3,3]],
      },
      name: 'Some Dude',
      dialog: {
        id: 'some-dude-generic',
        conversations,
      },
      hero,
      initFrame,
    });
  }
}

export default SomeDude;
