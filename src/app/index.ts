import * as Phaser from 'phaser-ce';
import Plain from './states/plain';

class Game extends Phaser.Game {
  constructor() {
    super(600, 600, Phaser.AUTO);

    this.state.add('Plain', Plain, false);
    this.state.start('Plain');
  }
}

new Game(); // eslint-disable-line no-new

