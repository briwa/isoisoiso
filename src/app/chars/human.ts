import HumanSprite from '../sprites/human';

import { shapePaths } from './helper';

const DURATION = 500;

class Human extends HumanSprite {
  private speed;
  private paths;
  private bounds;
  private map;

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
    this.map.setWalkable(config.x / this.map.tilesize, config.y / this.map.tilesize, false);
  }

  moveTo({ x, y, onStart, onFinished }: {x: number, y: number, onStart?: any, onFinished: any}) {
    // in normal case, we use the current position as the start of position
    // to be used for pathfinding
    const startPos = {
      x: this.currentPos(true).x,
      y: this.currentPos(true).y,
    };

    const moving = this.paths.length > 0;

    if (moving) {
      // do not stop animation when interrupting
      this.stopTween();

      // when moving, the start of the new paths is no longer the current position,
      // it's the end of the animation's position
      startPos.x = this.paths[0].x;
      startPos.y = this.paths[0].y;
    }

    const walkablePaths = this.map.findPath(startPos.x, startPos.y, x, y);
    const finalPaths = moving ?
      // append the paths with the initial paths when moving, to determine direction
      [[this.currentPos().x, this.currentPos().y]].concat(walkablePaths) :

      // otherwise just use the original paths
      walkablePaths;

    // no need to proceed when there's no paths
    // or when trying to move to the same position as the curret one
    if (
      finalPaths.length === 0 ||
      (
        finalPaths.length === 1 &&
        finalPaths[0][0] === startPos.x &&
        finalPaths[0][1] === startPos.y
      )
    ) {
      if (onFinished) onFinished();
      return false;
    }

    this.paths = shapePaths(finalPaths);

    if (onStart) onStart(walkablePaths);
    return this.startPaths(onFinished);
  }

  startPaths(onFinished) {
    const {x, y, direction, speed} = this.paths[0];

    // update walkable tile and bounds
    this.map.setWalkable(x, y, false);
    this.map.setWalkable(this.currentPos(true).x, this.currentPos(true).y, true);

    const nowTweening = this.tweenTo({
      x,
      y,
      speed: speed * DURATION,
      onStart: () => {
        this.playAnimation(`walk-${direction}`);
      },
      onComplete: () => {
        // remove the tween that is already done
        this.paths = this.paths.slice(1);
        const next = this.paths[0];

        // only stop when there's no more paths left
        // we want the animation to run seamlessly
        if (!this.paths.length) this.stopAnimation();

        // do not go to the next one when failed, or when there's no tweens left
        if (next) {
          this.startPaths(onFinished);
        } else if (onFinished) {
          onFinished(this.paths);
        }
      },
    });

    return nowTweening;
  }
}

export default Human;
