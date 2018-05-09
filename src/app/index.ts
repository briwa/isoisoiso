import * as Phaser from 'phaser-ce';
import Plain from './states/plain';

const states = {
  plain : Plain,
};

class Game extends Phaser.Game {
  constructor() {
    super(600, 600, Phaser.AUTO);

    this.state.add('plain', Plain, false);
    this.state.start('plain');
  }
}

new Game(); // eslint-disable-line no-new
