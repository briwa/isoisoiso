// NOTE: This class is to separate human side effects (phaserjs-related) from the logics (chars/human)
// TODO:
// - consider cleaning up signals on destroy?
import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';
import Npc from 'src/app/chars/base/npc';
import Hero from 'src/app/chars/hero';

import MapPlain from 'src/app/maps/plain';

export interface MovementTrack {
  type: 'track';
  input: [number, number][];
};

export interface MovementFollow {
  type: 'follow';
  input: Human;
};

export interface MovementMouse {
  type: 'mouse';
  input?: Phaser.Plugin.Isometric.Point3;
};

export interface MovementKeys {
  type: 'keys';
  input: { [key:string]: Phaser.Key };
};

export type Direction = 'up' | 'down' | 'left' | 'right';

// people sprite every 43 frames
export interface Config {
  x: number;
  y: number;
  z: number;
  map: MapPlain;
  game?: Phaser.Game;
  sprite?: string; // sprite name on the spritesheet
  delimiter?: number;
  group?: Phaser.Group;
  movement: MovementTrack | MovementFollow | MovementKeys | MovementMouse;
};

class SpriteHuman {
  private tilesize: number;

  game: Phaser.Game;
  anchorX: number = 1/4;
  anchorY: number = 1/4;
  sprite: Phaser.Plugin.Isometric.IsoSprite;
  movement: MovementTrack | MovementFollow | MovementKeys | MovementMouse;

  static loadAssets(game: Phaser.Game) {
    // https://opengameart.org/content/isometric-people
    game.load.spritesheet('people', 'assets/images/people.png', 32, 49);
  }

  constructor({ game, x, y, z, sprite, delimiter, group, map, movement }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    this.game = game;
    this.tilesize = map.tilesize;

    this.sprite = this.game.add.isoSprite(x + (this.anchorX * this.tilesize), y + (this.anchorY * this.tilesize), z, sprite, delimiter, group);

    // animation setup
    this.sprite.anchor.set(0.5);
    this.sprite.animations.add('walk-up', [30, 31, 32, 33, 34, 35, 36, 37, 38].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-left', [20, 21, 22, 23, 24, 25, 26, 27, 28].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-right', [10, 11, 12, 13, 14, 15, 16, 17, 18].map(i => i + delimiter), 30, true);
    this.sprite.animations.add('walk-down', [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => i + delimiter), 30, true);

    // arcade
    this.game.physics.isoArcade.enable(this.sprite);
    this.sprite.body.collideWorldBounds = true;

    this.movement = movement;

    // circular reference!!!
    // needed for side effect things
    // TODO: just do this for now to escape the typings
    this.sprite['char'] = this;
  }

  setImmovable(toggle: boolean) {
    this.sprite.body.immovable = toggle;
  }

  position(floor = false) {
    const x = this.sprite.isoX / this.tilesize;
    const y = this.sprite.isoY / this.tilesize;
    return {
      x: floor ? Math.floor(x) : x,
      y: floor ? Math.floor(y) : y,
    };
  }

  currentAnimation() {
    return this.sprite.animations.currentAnim;
  }

  playAnimation(name: string) {
    // do not play the same animation twice
    // if this is the first movement (from static to moving),
    // always play the animation regardless
    if (!this.currentAnimation().isPlaying || this.currentAnimation().name !== name) {
      this.sprite.animations.play(name);
    }
  }

  stopAnimation(name?: string) {
    this.sprite.animations.stop(name || this.currentAnimation().name, true);
  }

  setAnimation(name: string) {
    // TODO: find out why we can't just simply set an animation frame
    this.playAnimation(name);
    this.stopAnimation();
  }

  stopOppositeAnimation(name?: string) {
    const oppositeDirection = (name) => {
      if (name === 'walk-up') {
        return 'walk-down';
      }

      if (name === 'walk-down') {
        return 'walk-up';
      }

      if (name === 'walk-left') {
        return 'walk-right';
      }

      if (name === 'walk-right') {
        return 'walk-left';
      }
    };

    this.setAnimation(oppositeDirection(name || this.currentAnimation().name));
  }

  goTo(direction: Direction, velocity = 0) {
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

export default SpriteHuman;
