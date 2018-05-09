import HumanSprite from '../sprites/human';
import { shapePaths } from './helper';

interface Path {
  x: number;
  y: number;
  direction: string;
  speed: number;
};

class Human extends HumanSprite {
  private map;
  private speed: number = 1;
  private duration: number = 100; // max speed, don't go higher than this

  public paths: Path[] = [];

  constructor(config) {
    super({ ...config, tilesize: config.map.tilesize });

    // setup map
    this.map = config.map;
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
      this.listen('stopping', onFinished);
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

    const {x, y, direction, speed} = this.paths[0];
    const velocity = speed * this.duration;

    // start moving
    this.goTo(direction, velocity);

    // once the diff gets smaller than treshold, means we're at the end of the path
    const curr = this.position();
    const treshold = 10 / this.duration;
    const diffX = curr.x - x;
    const diffY = curr.y - y;

    if (
      diffX >= 0 && diffX <= treshold && (direction === 'left' || direction === 'right') ||
      diffY >= 0 && diffY <= treshold && (direction === 'up' || direction === 'down')
    ) {
      // remove the tween that is already done
      this.paths = this.paths.slice(1);
    }
  }

  onStopMoving() {
    this.goTo(null);
    this.dispatch('stopping');
  }
}

export default Human;
