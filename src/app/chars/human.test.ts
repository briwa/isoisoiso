import Human from './human';

// test using the default map
import PlainMap from 'src/app/maps/plain';

jest.mock('phaser-ce', () => ({}));

let human;
let map;

describe('Human test', () => {
  beforeEach(() => {
    map = new PlainMap(null);
    // this is just to test the no-path case
    map.setWalkable(4, 4, false);

    // spy on the walkable of the map
    map.setWalkable = jest.fn().mockImplementation(map.setWalkable);

    human = new Human({
      x: 0,
      y: 0,
      z: 0,
      map,
      movement: {
        type: 'mouse',
      },
    });

    // mock all side effect functions
    human.position = jest.fn();
    human.playAnimation = jest.fn();
    human.stopAnimation = jest.fn();
    human.stopTween = jest.fn();
    human.tweenTo = jest.fn().mockImplementation(({ onStart, onComplete }) => ({
      onStart,
      onComplete,
    }));
  });

  describe('initialization', () => {
    test('all the default values', () => {
      expect(human.paths).toEqual([]);
      expect(human.duration).toEqual(100);
    });
  });

  describe('#generatePaths', () => {
    test('should return positions, directions, and speed', () => {
      const onFinished = () => {};

      // mock the current position
      human.position = () => ({
        x: 0,
        y: 0,
      });

      human.generatePaths({
        x: 0,
        y: 3,
        onFinished,
      });

      expect(human.paths).toEqual([
        {
          direction: 'down',
          x: 0,
          y: 1,
          speed: 1,
        },
        {
          direction: 'down',
          x: 0,
          y: 2,
          speed: 1,
        },
        {
          direction: 'down',
          x: 0,
          y: 3,
          speed: 1,
        },
      ]);

      expect(human.stopAnimation).not.toHaveBeenCalled();
    });

    test('should not continue when there\'s no paths', () => {
      human.position = () => ({
        x: 0,
        y: 0,
      });

      const output = human.generatePaths({
        x: 4,
        y: 4,
      });

      expect(output).toEqual([]);
      expect(human.paths).toEqual([]);
    });
  });

  // TODO: not tested
  describe.skip('#movePaths', () => {})
});
