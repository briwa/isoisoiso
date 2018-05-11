import Phaser from 'phaser-ce';

import Hero from '../chars/hero';
import Npc from '../chars/npc';

import HumanSprite from '../sprites/human';
import PlainMap from '../maps/plain';

class Plain extends Phaser.State {
  private hero: Hero;
  private npc: Npc;

  private cursor: Phaser.Plugin.Isometric.Point3;
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

    this.map = new PlainMap(this.game);

    this.hero = new Hero({
      x: 0,
      y: 0,
      game: this.game,
      group: this.map.group,
      map: this.map,
    });

    this.npc = new Npc({
      x: 7,
      y: 3,
      game: this.game,
      group: this.map.group,
      map: this.map,
      track: [[7,3], [3,3]],
    });

    // register mouse down input here
    this.game.input.onDown.add(() => {
      // for hero movement
      const cursor = {
        x: Math.floor(this.cursor.x / this.map.tilesize),
        y: Math.floor(this.cursor.y / this.map.tilesize),
      };

      // ignore out of bounds clicks
      if (cursor.x >= 0 && cursor.y >= 0 && cursor.x < this.map.grid.length && cursor.y < this.map.grid.length) {
        this.hero.generatePaths({
          x: cursor.x,
          y: cursor.y,
        });
      }
    });
  }

  update() {
    // project the current mouse from x/y position to x/y/z position of the isometric map, into this.cursor
    this.game.iso.unproject(this.game.input.activePointer.position, this.cursor);

    this.hero.movePaths();
    this.npc.movePaths();

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
