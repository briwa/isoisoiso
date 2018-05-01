import * as Phaser from 'phaser-ce';
import Plain from './states/plain';
import Test from './states/test';

const states = {
  plain : Plain,
  test : Test,
};

class Game extends Phaser.Game {
  constructor() {
    super(600, 600, Phaser.AUTO);

    const state = window.location.hash.toLowerCase().replace('#', '') || 'plain';

    this.state.add(state, states[state], false);
    this.state.start(state);
  }
}

new Game(); // eslint-disable-line no-new

