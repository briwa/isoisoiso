import Phaser from 'phaser-ce';

import { TILESIZE } from '../maps/default';

const getDir = (prev, next) => {
  if (prev[0] === next[0] && prev[1] === next[1]) {
    return null;
  } else if (prev[0] === next[0]) {
    return prev[1] > next[1] ? 'up' : 'down';
  } else if (prev[1] === next[1]) {
    return prev[0] > next[0] ? 'left' : 'right';
  }

  return false;
};

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
  }

  move(paths, doneCb = () => {}) {
    // shouldn't be moving when on the move
    if (this.animations.currentAnim.isPlaying || paths.length === 0) return false;

    this.startTween(
      paths.reduce((newPath, next) => {
        // always take the last position as the reference
        // if there's none, use the first position as the current one
        const currPos = newPath[newPath.length - 1] || { coord: next };

        // assign direction for the next one
        newPath.push({ coord: next, dir: getDir(currPos.coord, next) || 'init' });

        return newPath;
      }, []).slice(1), // skip first path since the first one is just the initial position
      doneCb);

    return true;
  }

  startTween(paths, doneCb) {
    const curr = paths[0];
    if (!curr) {
      // no more paths left, means it's stopped moving
      doneCb();
      return;
    }

    // slice now to get the remaining path right away
    // since we're using it for references below
    const remainingPath = paths.slice(1);

    // set the position now, since the tween wont break in the middle of the action anyway
    // the position will definitely being set to the next one
    this.currPos.set(curr.coord[0], curr.coord[1]);
    const currDirAnim = `walk-${curr.dir}`;

    const tween = this.game.add.tween(this).to({
      isoX: this.currPos.x * TILESIZE,
      isoY: this.currPos.y * TILESIZE,
    }, 500, Phaser.Easing.Linear.None, false);

    tween.onStart.add((sprite) => {
      // do not play the same animation twice
      // if this is the first movement (from static to moving),
      // always play the animation regardless
      const currentAnim = sprite.animations.currentAnim;
      if (!currentAnim.isPlaying || currentAnim.name !== currDirAnim) {
        sprite.animations.play(currDirAnim);
      }
    });

    tween.onComplete.add((sprite) => {
      // only stop when there's no more paths left
      // we want the animation to run seamlessly
      if (!remainingPath.length) {
        sprite.animations.stop(currDirAnim, true);
      }

      this.startTween(remainingPath, doneCb);
    });

    tween.start();
  }
}

export default Player;
