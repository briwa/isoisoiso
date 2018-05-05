// This class is to separate human side effects (phaserjs-related) from the logics (chars/human)
// people sprite every 43 frames

class HumanSprite {
  private game;
  private currentTween;
  private tilesize;

  public sprite;

  static loadAssets(game) {
    // https://opengameart.org/content/isometric-people
    game.load.spritesheet('people', 'assets/images/people.png', 32, 49);
  }

  constructor({ game, x, y, z, sprite, delimiter, group, tilesize }) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    this.game = game;
    this.tilesize = tilesize;

    this.sprite = this.game.add.isoSprite(x, y, z, sprite, delimiter, group);

    // animation setup
    this.sprite.anchor.set(0.5);
    this.sprite.animations.add('walk-up', [30, 31, 32, 33, 34, 35, 36, 37, 38].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-left', [20, 21, 22, 23, 24, 25, 26, 27, 28].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-right', [10, 11, 12, 13, 14, 15, 16, 17, 18].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-down', [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => i + delimiter), 30, true);

    this.game.physics.isoArcade.enable(this.sprite);
    this.sprite.body.collideWorldBounds = true;
  }

  currentPos(floor = false) {
    const x = this.sprite.isoX / this.tilesize;
    const y = this.sprite.isoY / this.tilesize;
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

  goTo(direction, velocity = 0) {
    if (!direction) {
      this.stopAnimation();

      // no velocity means stopping
      this.sprite.body.velocity.x = 0;
      this.sprite.body.velocity.y = 0;
    }

    this.playAnimation(`walk-${direction}`);

    // only activate one velocity at a time
    // otherwise it would move diagonally
    switch (direction) {
      case 'up':
        this.sprite.body.velocity.y = -velocity;
        this.sprite.body.velocity.x = 0;
        break;
      case 'down':
        this.sprite.body.velocity.y = velocity;
        this.sprite.body.velocity.x = 0;
        break;
      case 'left':
        this.sprite.body.velocity.x = -velocity;
        this.sprite.body.velocity.y = 0;
        break;
      case 'right':
        this.sprite.body.velocity.x = velocity;
        this.sprite.body.velocity.y = 0;
        break;
    }
  }
}

export default HumanSprite;
