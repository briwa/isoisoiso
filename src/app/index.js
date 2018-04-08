import Phaser from 'phaser-ce';
import Boot from './states/boot';

class Game extends Phaser.Game {
  constructor() {
    super(600, 600, Phaser.AUTO);

    this.state.add('Boot', Boot, false);
    this.state.start('Boot');
  }
}

new Game(); // eslint-disable-line no-new

