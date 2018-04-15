import Phaser from 'phaser-ce';

// people sprite every 43 frames
// todo: find a way to extract this out of the class component
import { TILESIZE } from '../maps/default';

const DURATION = 500;

const getDir = (prev, next) => {
  if (prev[0] === next[0]) return prev[1] > next[1] ? 'up' : 'down';
  if (prev[1] === next[1]) return prev[0] > next[0] ? 'left' : 'right';
  return false;
};

function shapePaths(paths, initialDuration = DURATION) {
  const initialPath = paths[0];
  return paths.slice(1).reduce((newPath, next, idx) => {
    // always take the last position as the reference
    // if there's none, use the first position as the current one
    const currPos = newPath[newPath.length - 1] || { coord: initialPath };

    // assign direction for the next one
    const dir = getDir(currPos.coord, next);
    const duration = idx === 0 ? initialDuration : DURATION;
    newPath.push({ coord: next, dir, duration });

    return newPath;
  }, []);
}

class Player extends Phaser.Plugin.Isometric.IsoSprite {
  constructor({ game, x, y, z, sprite, group, delimiter, map }) {
    super(game, x, y, z, sprite, delimiter);
    group.add(this);

    this.game = game;

    this.anchor.set(0.5);

    this.animations.add('walk-up', [30, 31, 32, 33, 34, 35, 36, 37, 38].map(i => i + delimiter), 30, true);
    this.animations.add('walk-left', [20, 21, 22, 23, 24, 25, 26, 27, 28].map(i => i + delimiter), 30, true);
    this.animations.add('walk-right', [10, 11, 12, 13, 14, 15, 16, 17, 18].map(i => i + delimiter), 30, true);
    this.animations.add('walk-down', [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => i + delimiter), 30, true);

    this.currTween = null;
    this.bounds = {
      up: [],
      down: [],
      left: [],
      right: [],
    };

    this.map = map;
  }

  move({ x, y, check, start, done }) {
    let initialDuration = DURATION;

    // in normal case, we use the current position as the start of position
    // to be used for pathfinding
    const startPos = {
      x: this.currPos().x,
      y: this.currPos().y,
    };

    const moving = this.animations.currentAnim.isPlaying;

    if (moving) {
      this.currTween.stop();

      // when moving, the start of the new paths is no longer the current position,
      // it's the end of the animation's position
      startPos.x = this.currTween.timeline[0].vEnd.isoX / TILESIZE;
      startPos.y = this.currTween.timeline[0].vEnd.isoY / TILESIZE;

      // the currently running tween needs to be continued
      initialDuration = DURATION * (1 - this.currTween.timeline[0].percent);
    }

    const paths = this.map.findPath(startPos.x, startPos.y, x, y);

    // no need to proceed when there's no paths
    if (paths.length === 0) {
      done();
      return;
    }

    const tweens = shapePaths(
      moving ? [[this.currPos().x, this.currPos().y]].concat(paths) : paths,
      initialDuration);

    this.startTween(tweens, check, done);

    if (start) start(paths);
  }

  startTween(tweens, check, done) {
    const curr = tweens[0];
    if (!curr) {
      // no more paths left, means it's stopped moving
      if (done) done();
      return;
    }

    const currDirAnim = `walk-${curr.dir}`;

    if (check && check(curr.coord[0], curr.coord[1]) && this.currTween) {
      this.currTween.stop();
      this.animations.stop(currDirAnim, true);
      return;
    }

    this.setBounds(curr.coord[0], curr.coord[1]);

    // slice now to get the remaining path right away
    // since we're using it for references below
    const remainingPath = tweens.slice(1);

    this.currTween = this.game.add.tween(this).to({
      isoX: curr.coord[0] * TILESIZE,
      isoY: curr.coord[1] * TILESIZE,
    }, curr.duration, Phaser.Easing.Linear.None, false);

    this.currTween.onStart.add((sprite) => {
      // do not play the same animation twice
      // if this is the first movement (from static to moving),
      // always play the animation regardless
      const currentAnim = sprite.animations.currentAnim;
      if (!currentAnim.isPlaying || currentAnim.name !== currDirAnim) {
        sprite.animations.play(currDirAnim);
      }
    });

    this.currTween.onComplete.add((sprite) => {
      // only stop when there's no more paths left
      // we want the animation to run seamlessly
      if (!remainingPath.length) {
        sprite.animations.stop(currDirAnim, true);
      }

      this.startTween(remainingPath, check, done);
    });

    this.currTween.start();
  }

  currPos(floor) {
    const x = this.isoPosition.x / TILESIZE;
    const y = this.isoPosition.y / TILESIZE;
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
}

export default Player;
