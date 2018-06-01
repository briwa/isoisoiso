import Phaser from 'phaser-ce';
import Plain from 'src/app/states/plain';
import Battle from 'src/app/states/battle';

class Game extends Phaser.Game {
  constructor() {
    super(640, 480, Phaser.AUTO);

    this.state.add('Plain', Plain, false);
    this.state.add('Battle', Battle, true);
  }
}

new Game(); // eslint-disable-line no-new
