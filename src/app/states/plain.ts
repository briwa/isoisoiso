import Phaser from 'phaser-ce';

import Hero from '../chars/hero';
import Npc from '../chars/npc';

import HumanSprite from '../sprites/human';
import PlainMap from '../maps/plain';

class Plain extends Phaser.State {
  private hero: Hero;
  private npc: Npc;

  private cursor: Phaser.Plugin.Isometric.Point3;
  private keys: { [key:string]: Phaser.Key };
  private map: PlainMap;

  private debug: boolean;

  constructor() {
    super();

    this.cursor = new Phaser.Plugin.Isometric.Point3();
    this.debug = true;
  }

  preload() {
    // load all the sprites assets
    HumanSprite.loadAssets(this.game);
    PlainMap.loadAssets(this.game);

    // Add and enable the plug-in.
    this.game.plugins.add(Phaser.Plugin.Isometric);
    this.game.time.advancedTiming = true; // for physics, i'm still not sure what is the use yet

    this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

    // adjust the anchors of the sprites
    // these numbers are really from trial and error, could be improved
    this.game.iso.anchor.setTo(0.5, 0.25);
  }

  create() {
    this.game.physics.isoArcade.gravity.setTo(0, 0, -500);

    this.keys = {
      w: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
      a: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
      s: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
      d: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
    };

    this.map = new PlainMap(this.game);

    this.hero = new Hero({
      x: 0,
      y: 0,
      game: this.game,
      group: this.map.group,
      map: this.map,
      movement: {
        type: 'keys',
        input: this.keys,
      },
    });

    this.npc = new Npc({
      x: 7,
      y: 3,
      game: this.game,
      group: this.map.group,
      map: this.map,
      movement: {
        type: 'track',
        input: [[7,3], [3,3]],
      },
    });
  }

  update() {
    // project the current mouse from x/y position to x/y/z position of the isometric map, into this.cursor
    this.game.iso.unproject(this.game.input.activePointer.position, this.cursor);

    this.hero.registerMovement();
    this.npc.registerMovement();

    // sort sprites so it would look nice when other sprites are moving
    this.map.sortSprites();
    this.map.collisionCheck();
  }

  render() {
    if (this.debug) {
      // show cursor position and current player paths
      this.map.debug({
        cursor: this.cursor,
        paths: this.hero.paths,
      });

      // body debug
      this.game.debug.body(this.hero.sprite);
      this.game.debug.body(this.npc.sprite);

      // just some text for debugging paths
      this.game.debug.text(`current x: ${this.hero.position().x.toFixed(2)}, y: ${this.hero.position().y.toFixed(2)}`, 0, 32);
      if (this.hero.paths.length) {
        this.hero.paths.forEach((path, idx) => {
          this.game.debug.text(`x: ${path.x}, y: ${path.y}, dir: ${path.direction}`, 0, 48 + (idx * 16));
        });
      }
    }
  }
}

export default Plain;
