import Phaser from 'phaser-ce';

import Hero from '../chars/hero';
import Npc from '../chars/npc';

import HumanSprite from '../sprites/human';
import DialogSprite from '../sprites/dialog';
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

    this.debug = true;
  }

  preload() {
    // load all the sprites assets
    HumanSprite.loadAssets(this.game);
    PlainMap.loadAssets(this.game);
    DialogSprite.loadAssets(this.game);

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
    };

    this.map = new PlainMap(this.game);

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
      name: 'Some Dude',
      conversations: [{
        id: 1,
        type: 'dialog',
        text: 'Long time no see, chap. How are you?',
      }, {
        id: 2,
        type: 'dialog',
        text: 'Was wondering if you could help me with something?',
      }, {
        id: 3,
        type: 'menu',
        text: '',
        options: [{
          text: 'Sure, what is it?',
          nextId: 5,
        }, {
          text: 'Aw maybe next time...',
          nextId: 4,
        }],
      }, {
        id: 4,
        type: 'conversation',
        conversations: [{
          id: 6,
          type: 'dialog',
          text: 'Fine, next time it is!'
        }],
      }, {
        id: 5,
        type: 'conversation',
        conversations: [{
          id: 7,
          type: 'dialog',
          text: 'Ok so can you get lost? Thanks.'
        }],
      }],
      hero: this.hero,
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
      this.game.debug.text(`contact x: ${this.npc.contact}`, 0, 16);
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
