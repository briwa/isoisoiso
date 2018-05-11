import { shapePaths } from './helper';
import PlainMap from '../maps/plain';
import HumanSprite, { Config, Direction, MovementKeys } from '../sprites/human';

export interface Path {
  x: number;
  y: number;
  direction: Direction;
};

class Human extends HumanSprite {
  private map: PlainMap;
  private speed: number = 100; // max speed, don't go higher than this

  public paths: Path[] = [];

  constructor(config: Config) {
    super(config);

    // setup map
    this.map = config.map;
  }

  registerMovement() {
    switch (this.movement.type) {
      case 'mouse':
      case 'track':
      case 'follow':
        this.movePaths();
        break;
      case 'keys':
        this.moveKeys();
        break;
      default:
        throw new Error('Invalid movement type!');
    }
  }

  generatePaths({ x, y, onFinished }: {x: number, y: number, onFinished?: Function }): Path[] {
    // in normal case, we use the current position as the start of position
    // to be used for pathfinding
    const startPos = {
      x: this.position(true).x,
      y: this.position(true).y,
    };

    const walkablePaths = this.map.findPath(startPos.x, startPos.y, x, y);

    // no need to proceed when there's no paths
    const noPath = walkablePaths.length === 0;

    if (noPath) {
      this.stopAnimation();
      return [];
    }

    if (onFinished) {
      this.listenOnce('pathsFinished', onFinished);
    }

    this.paths = shapePaths(walkablePaths);
    return this.paths;
  }

  movePaths() {
    // only stop when there's no more paths left
    // we want the animation to run seamlessly
    if (!this.paths.length) {
      this.onStopMoving();
      return;
    }

    const {x, y, direction} = this.paths[0];

    // start moving
    this.goTo(direction, this.speed);

    // once the diff gets smaller than treshold, means we're at the end of the path
    const curr = this.position();
    const treshold = 5 / this.speed;
    const diffX = Math.abs((curr.x - this.anchorX) - x);
    const diffY = Math.abs((curr.y - this.anchorY) - y);

    if (
      diffX >= 0 && diffX <= treshold && (direction === 'left' || direction === 'right') ||
      diffY >= 0 && diffY <= treshold && (direction === 'up' || direction === 'down')
    ) {
      this.dispatch('pathEnd');
      // remove the tween that is already done
      this.paths = this.paths.slice(1);
    }
  }

  moveKeys() {
    const movement = <MovementKeys> this.movement;
    if (movement.input.w.isDown) {
      this.goTo('up', this.speed);
    } else if (movement.input.s.isDown) {
      this.goTo('down', this.speed);
    } else if (movement.input.a.isDown) {
      this.goTo('left', this.speed);
    } else if (movement.input.d.isDown) {
      this.goTo('right', this.speed);
    } else {
      this.goTo(null);
    }
  }

  onStopMoving() {
    this.goTo(null);
    this.dispatch('pathsFinished');
  }
}

export default Human;
