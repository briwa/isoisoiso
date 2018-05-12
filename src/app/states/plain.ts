import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import SomeDude from 'src/app/chars/villagers/some-dude';
import Merchant from 'src/app/chars/merchants/basic';

import SpriteHuman from 'src/app/sprites/human';
import SpriteDialog from 'src/app/sprites/dialog';
import MapPlain from 'src/app/maps/plain';

class Plain extends Phaser.State {
  private hero: Hero;

  private someDude: SomeDude;
  private merchant: Merchant;

  private cursor: Phaser.Plugin.Isometric.Point3;
  private keys: { [key:string]: Phaser.Key };
  private map: MapPlain;

  private debug: boolean;

  constructor() {
    super();

    this.debug = false;
  }

  preload() {
    // load all the sprites assets
    SpriteHuman.loadAssets(this.game);
    MapPlain.loadAssets(this.game);
    SpriteDialog.loadAssets(this.game);

    // Add and enable the plug-in.
    this.game.plugins.add(Phaser.Plugin.Isometric);
    this.game.time.advancedTiming = true; // for physics, i'm still not sure what is the use yet
    this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

    // adjust the anchors of the sprites
    // these numbers are really from trial and error, could be improved
    this.game.iso.anchor.setTo(0.5, 0.25);
  }

  create() {
    this.cursor = new Phaser.Plugin.Isometric.Point3();
    this.game.physics.isoArcade.gravity.setTo(0, 0, -500);

    this.keys = {
      w: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
      a: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
      s: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
      d: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
      p: this.game.input.keyboard.addKey(Phaser.Keyboard.P),
      o: this.game.input.keyboard.addKey(Phaser.Keyboard.O),
      ',': this.game.input.keyboard.addKey(Phaser.Keyboard.COMMA),
      '.': this.game.input.keyboard.addKey(Phaser.Keyboard.PERIOD),
    };

    this.map = new MapPlain(this.game);

    this.hero = new Hero({
      x: 6,
      y: 3,
      game: this.game,
      group: this.map.group,
      map: this.map,
      movement: {
        type: 'keys',
        input: this.keys,
      },
      controls: this.keys,
    });

    this.someDude = new SomeDude({
      game: this.game,
      group: this.map.group,
      map: this.map,
      hero: this.hero,
    });

    this.merchant = new Merchant({
      game: this.game,
      group: this.map.group,
      map: this.map,
      hero: this.hero,
    });
  }

  update() {
    // project the current mouse from x/y position to x/y/z position of the isometric map, into this.cursor
    this.game.iso.unproject(this.game.input.activePointer.position, this.cursor);

    this.hero.registerMovement();
    this.someDude.registerMovement();

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
      this.game.debug.body(this.someDude.sprite);

      // just some text for debugging paths
      this.game.debug.text(`someDude contact? ${this.someDude.contact}`, 0, 16);
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
