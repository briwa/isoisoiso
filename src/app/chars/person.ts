import * as Phaser from 'phaser-ce';

import { shapePaths } from './helper';

// people sprite every 43 frames
const DURATION = 500;

class Player {
  private speed;
  private tweens;
  private currentTween;
  private bounds;
  private map;
  private game;
  private sprite;

  constructor(config) {
    this.speed = 1; // by default the speed is 100%, not slowed down or doubled up

    this.tweens = [];
    this.currentTween = null;

    this.bounds = {
      up: [],
      down: [],
      left: [],
      right: [],
    };

    // setup map
    this.map = config.map;
    this.map.setWalkable(config.x / this.map.tilesize, config.y / this.map.tilesize, false);

    // setup sprite
    if (config.game) this.setupSprite(config);
  }

  moveTo({ x, y, onStart, onFinished }: {x: number, y: number, onStart?: any, onFinished: any}) {
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
      startPos.x = this.tweens[0].position.x;
      startPos.y = this.tweens[0].position.y;
    }

    const paths = this.map.findPath(startPos.x, startPos.y, x, y);
    const finalPaths = moving ? [[this.currentPos().x, this.currentPos().y]].concat(paths) : paths;

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

    this.tweens = shapePaths(finalPaths);

    if (onStart) onStart(paths);
    return this.startTween(onFinished);
  }

  startTween(onFinished) {
    const current = this.tweens[0];

    // update walkable tile and bounds
    this.map.setWalkable(this.currentPos(true).x, this.currentPos(true).y, true);
    this.setBounds(current.position.x, current.position.y);

    const nowTweening = this.tweenTo({
      x: current.position.x,
      y: current.position.y,
      speed: current.speed * DURATION,
      onStart: () => {
        this.playAnimation(`walk-${current.direction}`);
      },
      onComplete: () => {
        // remove the tween that is already done
        this.tweens = this.tweens.slice(1);
        const next = this.tweens[0];

        // only stop when there's no more paths left
        // we want the animation to run seamlessly
        if (!this.tweens.length) this.stopAnimation();

        this.map.setWalkable(current.position.x, current.position.y, false);

        // do not go to the next one when failed, or when there's no tweens left
        if (next) {
          this.startTween(onFinished);
        } else if (onFinished) {
          onFinished(this.tweens);
        }
      },
    });

    return nowTweening;
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

  // -----------------------------------------------
  // phaser side effects
  // -----------------------------------------------
  setupSprite({ game, x, y, z, sprite, delimiter, group }) {
    this.game = game;
    this.sprite = this.game.add.isoSprite(x, y, z, sprite, delimiter, group);

    // animation setup
    this.sprite.anchor.set(0.5);
    this.sprite.animations.add('walk-up', [30, 31, 32, 33, 34, 35, 36, 37, 38].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-left', [20, 21, 22, 23, 24, 25, 26, 27, 28].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-right', [10, 11, 12, 13, 14, 15, 16, 17, 18].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-down', [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => i + delimiter), 30, true);
  }

  currentPos(floor = false) {
    const x = this.sprite.isoPosition.x / this.map.tilesize;
    const y = this.sprite.isoPosition.y / this.map.tilesize;
    return {
      x: floor ? Math.floor(x) : x,
      y: floor ? Math.floor(y) : y,
    };
  }

  // do not play the same animation twice
  // if this is the first movement (from static to moving),
  // always play the animation regardless
  playAnimation(animationName) {
    const currentAnim = this.sprite.animations.currentAnim;
    if (!currentAnim.isPlaying || currentAnim.name !== animationName) {
      this.sprite.animations.play(animationName);
    }
  }

  stopAnimation() {
    if (this.currentTween && this.currentTween.isRunning) this.currentTween.stop();
    this.sprite.animations.stop(this.sprite.animations.currentAnim.name, true);
  }

  tweenTo({ x, y, speed, onStart, onComplete }) {
    this.currentTween = this.game.add.tween(this.sprite).to({
      isoX: x * this.map.tilesize,
      isoY: y * this.map.tilesize,
    }, speed, Phaser.Easing.Linear.None, true);

    this.currentTween.onStart.add(onStart);
    this.currentTween.onComplete.add(onComplete);

    return {
      onStart,
      onComplete,
    };
  }
}

export default Player;
