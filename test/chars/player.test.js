import Player from 'src/app/chars/player';

// test using the default map
import { MAP } from 'src/app/maps/default';

jest.mock('phaser-ce', () => ({}));

describe('Player test', () => {
  test('initialization', () => {
    const player = new Player({
      x: 0,
      y: 0,
      z: 0,
      map: MAP,
    });

    expect(player.tweens).toEqual([]);
    expect(player.currentTween).toEqual(null);
    expect(player.bounds).toEqual({
      down: [],
      right: [],
      up: [],
      left: [],
    });
  });
});
