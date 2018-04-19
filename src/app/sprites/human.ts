// This class is to separate human side effects (phaserjs-related) from the logics (chars/human)
// people sprite every 43 frames

class HumanSprite {
  private game;
  private sprite;
  private currentTween;
  private tilesize;

  static loadAssets(game) {
    // https://opengameart.org/content/isometric-people
    game.load.spritesheet('people', 'assets/images/people.png', 32, 49);
  }

  constructor({ game, x, y, z, sprite, delimiter, group, tilesize }) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    this.game = game;
    this.sprite = this.game.add.isoSprite(x, y, z, sprite, delimiter, group);

    // animation setup
    this.sprite.anchor.set(0.5);
    this.sprite.animations.add('walk-up', [30, 31, 32, 33, 34, 35, 36, 37, 38].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-left', [20, 21, 22, 23, 24, 25, 26, 27, 28].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-right', [10, 11, 12, 13, 14, 15, 16, 17, 18].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-down', [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => i + delimiter), 30, true);

    this.tilesize = tilesize;
  }

  currentPos(floor = false) {
    const x = this.sprite.isoPosition.x / this.tilesize;
    const y = this.sprite.isoPosition.y / this.tilesize;
    return {
      x: floor ? Math.floor(x) : x,
      y: floor ? Math.floor(y) : y,
    };
  }

  playAnimation(animationName) {
    // do not play the same animation twice
    // if this is the first movement (from static to moving),
    // always play the animation regardless
    const currentAnim = this.sprite.animations.currentAnim;
    if (!currentAnim.isPlaying || currentAnim.name !== animationName) {
      this.sprite.animations.play(animationName);
    }
  }

  stopAnimation() {
    this.sprite.animations.stop(this.sprite.animations.currentAnim.name, true);
  }

  stopTween() {
    if (this.currentTween) this.currentTween.stop();
  }

  tweenTo({ x, y, speed, onStart, onComplete }) {
    this.currentTween = this.game.add.tween(this.sprite).to({
      isoX: x * this.tilesize,
      isoY: y * this.tilesize,
    }, speed, Phaser.Easing.Linear.None, true);

    this.currentTween.onStart.add(onStart);
    this.currentTween.onComplete.add(onComplete);

    return {
      onStart,
      onComplete,
    };
  }
}

export default HumanSprite;
