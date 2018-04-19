import * as Phaser from 'phaser-ce';

import Hero from '../chars/hero';
import Npc from '../chars/npc';

import HumanSprite from '../sprites/human';
import PlainMap from '../maps/plain';

class Plain extends Phaser.State {
  private mapGroup;
  private charGroup;

  private hero;
  private npc;

  private cursor;
  private paths;
  private map;

  constructor() {
    super();

    this.cursor = new Phaser.Plugin.Isometric.Point3();
    this.paths = [];
  }

  preload() {
    // load all the sprites assets
    HumanSprite.loadAssets(this.game);
    PlainMap.loadAssets(this.game);

    // Add and enable the plug-in.
    this.game.plugins.add(Phaser.Plugin.Isometric);
    this.game.time.advancedTiming = true; // for physics, i'm still not sure what is the use yet

    // adjust the anchors of the sprites
    // these numbers are really from trial and error, could be improved
    this.game.iso.anchor.setTo(0.5, 0.2);
  }

  create() {
    this.map = new PlainMap(this.game);

    this.hero = new Hero({
      x: 0,
      y: 0,
      game: this.game,
      group: this.map.groups.char,
      map: this.map,
    });

    this.npc = new Npc({
      game: this.game,
      group: this.map.groups.char,
      map: this.map,
      hero: this.hero,
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
        this.hero.moveTo({
          x: cursor.x,
          y: cursor.y,
          onStart: (paths) => {
            this.paths = paths;
          },
          onFinished: () => {
            this.paths = [];
          },
        });
      }
    });
  }

  update() {
    // project the current mouse from x/y position to x/y/z position of the isometric map, into this.cursor
    this.game.iso.unproject(this.game.input.activePointer.position, this.cursor);

    // show cursor position and current player paths
    this.map.debug({
      cursor: this.cursor,
      paths: this.paths,
    });

    // sort sprites so it would look nice when other sprites are moving
    this.map.sortSprites();
  }
}

export default Plain;
