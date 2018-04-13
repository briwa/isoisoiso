import Phaser from 'phaser-ce';

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
  constructor(game, x, y, z, key, frame, group) {
    super(game, x, y, z, key, frame);
    group.add(this);

    this.game = game;

    this.anchor.set(0.5);

    this.animations.add('walk-up', [30, 31, 32, 33, 34, 35, 36, 37, 38], 30, true);
    this.animations.add('walk-left', [20, 21, 22, 23, 24, 25, 26, 27, 28], 30, true);
    this.animations.add('walk-right', [10, 11, 12, 13, 14, 15, 16, 17, 18], 30, true);
    this.animations.add('walk-down', [0, 1, 2, 3, 4, 5, 6, 7, 8], 30, true);

    this.currPos = new Phaser.Plugin.Isometric.Point3();
    this.currTween = null;
    this.currPath = null;
  }

  move(paths, doneCb) {
    if (paths.length === 0) {
      return;
    }

    // shouldn't be moving when on the move
    if (this.animations.currentAnim.isPlaying) {
      this.currTween.stop();
      const initialDuration = DURATION * (1 - this.currTween.timeline[0].percent);

      const newX = this.isoPosition.x / TILESIZE;
      const newY = this.isoPosition.y / TILESIZE;

      const newPaths = [[newX, newY]].concat(paths);

      this.startTween(shapePaths(newPaths, initialDuration), doneCb);
    } else {
      this.startTween(shapePaths(paths), doneCb);
    }
  }

  startTween(paths, doneCb) {
    const curr = paths[0];
    if (!curr) {
      // no more paths left, means it's stopped moving
      if (doneCb) doneCb();
      return;
    }

    // slice now to get the remaining path right away
    // since we're using it for references below
    const remainingPath = paths.slice(1);

    // set the position now, since the tween wont break in the middle of the action anyway
    // the position will definitely being set to the next one
    this.currPos.set(curr.coord[0], curr.coord[1]);
    const currDirAnim = `walk-${curr.dir}`;

    this.currTween = this.game.add.tween(this).to({
      isoX: this.currPos.x * TILESIZE,
      isoY: this.currPos.y * TILESIZE,
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

      this.startTween(remainingPath, doneCb);
    });

    this.currTween.start();
  }
}

export default Player;
