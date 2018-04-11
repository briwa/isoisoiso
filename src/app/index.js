import Phaser from 'phaser-ce';
import Play from './states/play';

class Game extends Phaser.Game {
  constructor() {
    super(600, 600, Phaser.AUTO);

    this.state.add('Play', Play, false);
    this.state.start('Play');
  }
}

new Game(); // eslint-disable-line no-new

