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
    });

    // mock all side effect functions
    human.currentPos = jest.fn();
    human.playAnimation = jest.fn();
    human.stopAnimation = jest.fn();
    human.tweenTo = jest.fn().mockImplementation(({ onStart, onComplete }) => ({
      onStart,
      onComplete,
    }));
  });

  describe('initialization', () => {
    test('all the default values', () => {
      expect(human.paths).toEqual([]);
      expect(human.bounds).toEqual({
        down: [],
        right: [],
        up: [],
        left: [],
      });

      expect(map.setWalkable).toHaveBeenCalledWith(0, 0, false);
    });
  });

  describe('#moveTo', () => {
    test('should return positions, directions, and speed', () => {
      const onFinished = () => {};
      human.startPaths = jest.fn();

      // mock the current position
      human.currentPos = () => ({
        x: 0,
        y: 0,
      });

      human.moveTo({
        x: 3,
        y: 0,
        onFinished,
      });

      expect(human.paths).toEqual([
        {
          direction: 'right',
          x: 1,
          y: 0,
          speed: 1,
        },
        {
          direction: 'right',
          x: 2,
          y: 0,
          speed: 1,
        },
        {
          direction: 'right',
          x: 3,
          y: 0,
          speed: 1,
        },
      ]);

      expect(human.stopAnimation).not.toHaveBeenCalled();
      expect(human.startPaths).toHaveBeenCalledWith(onFinished);
    });

    test('should be able to continue paths properly', () => {
      human.paths = [{
        direction: 'right',
        x: 1,
        y: 0,
        speed: 1,
      }];

      human.currentPos = () => ({
        x: 0.3,
        y: 0,
      });

      const output = human.moveTo({
        x: 0,
        y: 2,
      });

      expect(output).not.toBe(false);

      expect(human.paths).toEqual([
        {
          direction: 'right',
          x: 1,
          y: 0,
          speed: 0.7,
        },
        {
          direction: 'down',
          x: 1,
          y: 1,
          speed: 1,
        },
        {
          direction: 'down',
          x: 1,
          y: 2,
          speed: 1,
        },
        {
          direction: 'left',
          x: 0,
          y: 2,
          speed: 1,
        },
      ]);

      expect(human.stopAnimation).toHaveBeenCalled();
    });

    test('should call onStart and onFinished properly', () => {
      human.currentPos = () => ({
        x: 0,
        y: 0,
      });

      const onStart = jest.fn();
      const onFinished = jest.fn();
      const output = human.moveTo({
        x: 0,
        y: 1,
        onStart,
        onFinished,
      });

      output.onComplete();

      expect(Object.keys(output)).toEqual(['onStart', 'onComplete']);
      expect(onStart).toHaveBeenCalled();
      expect(onFinished).toHaveBeenCalled();
    });

    test('should not continue when there\'s no paths', () => {
      human.currentPos = () => ({
        x: 0,
        y: 0,
      });

      const output = human.moveTo({
        x: 4,
        y: 4,
      });

      expect(output).toBe(false);

      expect(human.paths).toEqual([]);
    });

    test('should not move when going to the same position as the current one', () => {
      human.currentPos = () => ({
        x: 0,
        y: 0,
      });

      const onFinished = jest.fn();
      const output = human.moveTo({
        x: 0,
        y: 0,
        onFinished,
      });

      expect(output).toBe(false);

      expect(human.paths).toEqual([]);

      expect(onFinished).toHaveBeenCalled();
    });
  });

  describe('#startPaths', () => {
    const initialTween = [
      {
        direction: 'right',
        x: 1,
        y: 0,
        speed: 1,
      },
      {
        direction: 'right',
        x: 2,
        y: 0,
        speed: 1,
      },
      {
        direction: 'right',
        x: 3,
        y: 0,
        speed: 1,
      },
    ];

    test('should call tweenTo', () => {
      human.currentPos = () => ({
        x: 0,
        y: 0,
      });

      human.paths = initialTween;
      human.startPaths();

      // only test the x, y, and speed. callback no need to be tested
      const args = human.tweenTo.mock.calls[0][0];
      expect(args.speed).toBe(500);
      expect(args.x).toBe(1);
      expect(args.y).toBe(0);
    });

    test('should have all events fired when moving', () => {
      human.currentPos = () => ({
        x: 0,
        y: 0,
      });

      // right after the initialization, it will set walkable to false to current position
      expect(map.setWalkable.mock.calls[0]).toEqual([0, 0, false]);

      const onFinished = jest.fn();
      human.paths = initialTween;
      const tween = human.startPaths(onFinished);

      // initially it should set the current position to be walkable
      expect(map.setWalkable.mock.calls[1]).toEqual([0, 0, true]);

      // then play the animations on start
      tween.onStart();
      expect(human.playAnimation).toHaveBeenCalledWith('walk-right');

      // then at the end, it should set the next position to false
      tween.onComplete();
      expect(map.setWalkable.mock.calls[2]).toEqual([1, 0, false]);
      expect(human.paths).toEqual(initialTween.slice(1));

      // not doing any of these because we're still tweening
      expect(human.stopAnimation).not.toHaveBeenCalled();
      expect(onFinished).not.toHaveBeenCalled();
    });

    test('should stop and clean up events', () => {
      human.currentPos = () => ({
        x: 0,
        y: 0,
      });

      human.paths = initialTween.slice(2);
      const tween = human.startPaths();


      // since there's only one tween, it's empty on complete
      tween.onComplete();
      expect(human.paths).toEqual([]);

      // doing all the animation clean up
      expect(human.stopAnimation).toHaveBeenCalled();
    });
  });
});
