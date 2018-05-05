import HumanSprite from '../sprites/human';

import { shapePaths } from './helper';

class Human extends HumanSprite {
  private speed;
  private bounds;
  private map;
  private duration = 100; // max speed, don't go higher than this

  public paths;

  constructor(config) {
    super({ ...config, tilesize: config.map.tilesize });

    this.speed = 1; // by default the speed is 100%, not slowed down or doubled up
    this.paths = [];
    this.bounds = {
      up: [],
      down: [],
      left: [],
      right: [],
    };

    // setup map
    this.map = config.map;
  }

  moveTo({ x, y }: {x: number, y: number }) {
    // in normal case, we use the current position as the start of position
    // to be used for pathfinding
    const startPos = {
      x: this.currentPos(true).x,
      y: this.currentPos(true).y,
    };

    const moving = this.paths.length > 0;

    if (moving) {
      // when moving, the start of the new paths is no longer the current position,
      // it's the end of the animation's position
      startPos.x = this.paths[0].x;
      startPos.y = this.paths[0].y;
    }

    const walkablePaths = this.map.findPath(startPos.x, startPos.y, x, y);
    const finalPaths = moving && walkablePaths.length > 0 ?
      // append the paths with the initial paths when moving, to determine direction
      [[this.currentPos().x, this.currentPos().y]].concat(walkablePaths) :

      // otherwise just use the original paths
      walkablePaths;

    // no need to proceed when there's no paths
    // or when trying to move to the same position as the current one
    const samePosition = finalPaths.length === 1 &&
      finalPaths[0][0] === startPos.x &&
      finalPaths[0][1] === startPos.y;
    const noPath = finalPaths.length === 0;

    if ( samePosition || noPath ) {
      this.stopAnimation();
      return false;
    }

    this.paths = shapePaths(finalPaths);
  }

  movePaths() {
    // only stop when there's no more paths left
    // we want the animation to run seamlessly
    if (!this.paths.length) {
      this.goTo(null);
      return;
    }

    const {x, y, direction, speed} = this.paths[0];
    const velocity = speed * this.duration;

    // start moving
    this.goTo(direction, velocity);

    // once the diff gets smaller than treshold, means we're at the end of the path
    const curr = this.currentPos();
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
}

export default Human;
