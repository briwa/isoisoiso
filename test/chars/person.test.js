import Person from 'src/app/chars/person';

// test using the default map
import { DefaultMap } from 'src/app/maps/default';

jest.mock('phaser-ce', () => ({}));

let person;
let map;

describe('Person test', () => {
  beforeEach(() => {
    map = new DefaultMap();
    map.setWalkable(4, 4, false);

    // spy on the walkable of the map
    map.setWalkable = jest.fn().mockImplementation(map.setWalkable);

    person = new Person({
      x: 0,
      y: 0,
      z: 0,
      map,
    });

    // mock all side effect functions
    person.setupSprite = jest.fn();
    person.currentPos = jest.fn();
    person.playAnimation = jest.fn();
    person.stopAnimation = jest.fn();
    person.tweenTo = jest.fn().mockImplementation(({ onStart, onComplete }) => ({
      onStart,
      onComplete,
    }));
  });

  describe('initialization', () => {
    test('all the default values', () => {
      expect(person.tweens).toEqual([]);
      expect(person.currentTween).toEqual(null);
      expect(person.bounds).toEqual({
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
      person.startTween = jest.fn();

      person.currentPos = () => ({
        x: 0,
        y: 0,
      });

      person.moveTo({
        x: 3,
        y: 0,
        onFinished,
      });

      expect(person.tweens).toEqual([
        {
          direction: 'right',
          position: {
            x: 1,
            y: 0,
          },
          speed: 1,
        },
        {
          direction: 'right',
          position: {
            x: 2,
            y: 0,
          },
          speed: 1,
        },
        {
          direction: 'right',
          position: {
            x: 3,
            y: 0,
          },
          speed: 1,
        },
      ]);

      expect(person.stopAnimation).not.toHaveBeenCalled();
      expect(person.startTween).toHaveBeenCalledWith(onFinished);
    });

    test('should be able to continue paths properly', () => {
      person.tweens = [{
        direction: 'right',
        position: {
          x: 1,
          y: 0,
        },
        speed: 1,
      }];

      person.currentPos = () => ({
        x: 0.3,
        y: 0,
      });

      const output = person.moveTo({
        x: 0,
        y: 2,
      });

      expect(output).not.toBe(false);

      expect(person.tweens).toEqual([
        {
          direction: 'right',
          position: {
            x: 1,
            y: 0,
          },
          speed: 0.7,
        },
        {
          direction: 'down',
          position: {
            x: 1,
            y: 1,
          },
          speed: 1,
        },
        {
          direction: 'down',
          position: {
            x: 1,
            y: 2,
          },
          speed: 1,
        },
        {
          direction: 'left',
          position: {
            x: 0,
            y: 2,
          },
          speed: 1,
        },
      ]);

      expect(person.stopAnimation).toHaveBeenCalled();
    });

    test('should call onStart and onFinished properly', () => {
      person.currentPos = () => ({
        x: 0,
        y: 0,
      });

      const onStart = jest.fn();
      const onFinished = jest.fn();
      const output = person.moveTo({
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
      person.currentPos = () => ({
        x: 0,
        y: 0,
      });

      const onFinished = jest.fn();
      const output = person.moveTo({
        x: 4,
        y: 4,
        onFinished,
      });

      expect(output).toBe(false);

      expect(person.tweens).toEqual([]);

      expect(onFinished).toHaveBeenCalled();
    });
  });

  describe('#startTween', () => {
    const initialTween = [
      {
        direction: 'right',
        position: {
          x: 1,
          y: 0,
        },
        speed: 1,
      },
      {
        direction: 'right',
        position: {
          x: 2,
          y: 0,
        },
        speed: 1,
      },
      {
        direction: 'right',
        position: {
          x: 3,
          y: 0,
        },
        speed: 1,
      },
    ];

    test('should call tweenTo', () => {
      person.currentPos = () => ({
        x: 0,
        y: 0,
      });

      person.tweens = initialTween;
      person.startTween();

      // only test the x, y, and speed. callback no need to be tested
      const args = person.tweenTo.mock.calls[0][0];
      expect(args.speed).toBe(500);
      expect(args.x).toBe(1);
      expect(args.y).toBe(0);
    });

    test('should have all events fired when moving', () => {
      person.currentPos = () => ({
        x: 0,
        y: 0,
      });

      const onFinished = jest.fn();
      person.tweens = initialTween;
      const tween = person.startTween(onFinished);

      // initially it should set the current position to be walkable
      expect(map.setWalkable.mock.calls[1]).toEqual([0, 0, true]);

      // then play the animations on start
      tween.onStart();
      expect(person.playAnimation).toHaveBeenCalledWith('walk-right');

      // then at the end, it should set the next position to false
      tween.onComplete();
      expect(map.setWalkable.mock.calls[2]).toEqual([1, 0, false]);
      expect(person.tweens).toEqual(initialTween.slice(1));

      // not doing any of these because we're still tweening
      expect(person.stopAnimation).not.toHaveBeenCalled();
      expect(onFinished).not.toHaveBeenCalled();
    });

    test('should stop and clean up events', () => {
      person.currentPos = () => ({
        x: 0,
        y: 0,
      });

      const onFinished = jest.fn();
      person.tweens = initialTween.slice(2);
      const tween = person.startTween(onFinished);


      // since there's only one tween, it's empty on complete
      tween.onComplete();
      expect(person.tweens).toEqual([]);

      // doing all the animation clean up
      expect(person.stopAnimation).toHaveBeenCalled();
      expect(onFinished).toHaveBeenCalled();
    });
  });
});
