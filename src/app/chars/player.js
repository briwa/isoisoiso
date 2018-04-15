import Phaser from 'phaser-ce';

// people sprite every 43 frames
// todo: find a way to extract this out of the class component
import { TILESIZE } from '../maps/default';

const DURATION = 500;

function shapePaths(paths, initialSpeed) {
  const initialPos = {
    x: paths[0][0],
    y: paths[0][1],
  };

  const getDir = (prev, next) => {
    if (prev.x === next.x) return prev.y > next.y ? 'up' : 'down';
    if (prev.y === next.y) return prev.x > next.x ? 'left' : 'right';
    return false;
  };

  return paths.slice(1).reduce((newPath, next, idx) => {
    // always take the last position as the reference
    // if there's none, use the first position as the current one
    const current = newPath[newPath.length - 1] || { pos: initialPos };

    // assign direction for the next one
    const nextPos = {
      x: next[0],
      y: next[1],
    };

    const direction = getDir(current.pos, nextPos);
    const speed = idx === 0 ? initialSpeed : 1;
    newPath.push({
      pos: nextPos,
      direction,
      speed,
    });

    return newPath;
  }, []);
}

class Player {
  constructor({ game, x, y, z, sprite, group, delimiter, map }) {
    this.bounds = {
      up: [],
      down: [],
      left: [],
      right: [],
    };

    this.tweens = [];
    this.currentTween = null;
    this.speed = 1; // by default the speed is 100%, not slowed down or doubled up

    if (game && group) {
      // sprite setup
      this.game = game;
      this.sprite = this.game.add.isoSprite(x, y, z, sprite, delimiter, group);

      // animation setup
      this.sprite.anchor.set(0.5);
      this.sprite.animations.add('walk-up', [30, 31, 32, 33, 34, 35, 36, 37, 38].map(i => i + delimiter), 30, true);
      this.sprite.animations.add('walk-left', [20, 21, 22, 23, 24, 25, 26, 27, 28].map(i => i + delimiter), 30, true);
      this.sprite.animations.add('walk-right', [10, 11, 12, 13, 14, 15, 16, 17, 18].map(i => i + delimiter), 30, true);
      this.sprite.animations.add('walk-down', [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => i + delimiter), 30, true);
    }

    if (map) {
      // map setup
      this.map = map;
      this.map.setWalkable(x / TILESIZE, y / TILESIZE, false);
    }
  }

  move({ x, y, check, start, done }) {
    let initialSpeed = 1;

    // in normal case, we use the current position as the start of position
    // to be used for pathfinding
    const startPos = {
      x: this.currentPos(true).x,
      y: this.currentPos(true).y,
    };

    const moving = this.tweens.length > 0;

    if (moving) {
      this.stopAnimation();

      // when moving, the start of the new paths is no longer the current position,
      // it's the end of the animation's position
      startPos.x = this.tweens[0].pos.x;
      startPos.y = this.tweens[0].pos.y;

      // the currently running tween needs to be continued
      initialSpeed = 1 - this.currentTween.timeline[0].percent;
    }

    const paths = this.map.findPath(startPos.x, startPos.y, x, y);

    this.tweens = shapePaths(
      moving ? [[this.currentPos().x, this.currentPos().y]].concat(paths) : paths,
      initialSpeed);

    // no need to proceed when there's no paths
    if (this.tweens.length === 0) {
      if (done) done();
      return;
    }

    this.startTween(check, done);

    if (start) start(paths);
  }

  startTween(check, done) {
    const current = this.tweens[0];
    if (!current) {
      // no more paths left, means it's stopped moving
      if (done) done();
      return;
    }

    if (check && check(current.pos.x, current.pos.y) && this.currentTween) {
      this.stopAnimation();
      return;
    }

    // record bounds
    this.map.setWalkable(this.currentPos(true).x, this.currentPos(true).y, true);
    this.setBounds(current.pos.x, current.pos.y);

    this.currentTween = this.tweenTo({
      done,
      check,
      x: current.pos.x,
      y: current.pos.y,
      speed: current.speed * DURATION,
      direction: current.direction,
    });
  }

  currentPos(floor) {
    const x = this.sprite.isoPosition.x / TILESIZE;
    const y = this.sprite.isoPosition.y / TILESIZE;
    return {
      x: floor ? Math.floor(x) : x,
      y: floor ? Math.floor(y) : y,
    };
  }

  setBounds(x, y) {
    this.bounds.up = [x, y - 1];
    this.bounds.down = [x, y + 1];
    this.bounds.left = [x - 1, y];
    this.bounds.right = [x + 1, y];
  }

  isInbound(x, y, dir) {
    if (dir) {
      return this.bounds[dir][0] === x && this.bounds[dir][1] === y;
    }

    return (this.bounds.up[0] === x && this.bounds.up[1] === y) ||
      (this.bounds.down[0] === x && this.bounds.down[1] === y) ||
      (this.bounds.left[0] === x && this.bounds.left[1] === y) ||
      (this.bounds.right[0] === x && this.bounds.right[1] === y);
  }

  // phaser side effects
  stopAnimation() {
    if (this.currentTween) this.currentTween.stop();
    this.sprite.animations.stop(this.sprite.animations.currentAnim.name, true);
  }

  tweenTo({ x, y, speed, direction, check, done }) {
    const tween = this.game.add.tween(this.sprite).to({
      isoX: x * TILESIZE,
      isoY: y * TILESIZE,
    }, speed, Phaser.Easing.Linear.None, true);

    const currentDirection = `walk-${direction}`;

    tween.onStart.add(() => {
      // do not play the same animation twice
      // if this is the first movement (from static to moving),
      // always play the animation regardless
      const currentAnim = this.sprite.animations.currentAnim;
      if (!currentAnim.isPlaying || currentAnim.name !== currentDirection) {
        this.sprite.animations.play(currentDirection);
      }
    });

    tween.onComplete.add(() => {
      // remove the tween that is already done
      this.tweens = this.tweens.slice(1);

      // only stop when there's no more paths left
      // we want the animation to run seamlessly
      if (!this.tweens.length) {
        this.sprite.animations.stop(currentDirection, true);
      }

      this.map.setWalkable(x, y, false);

      this.startTween(check, done);
    });

    return tween;
  }
}

export default Player;
