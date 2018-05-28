import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';
import SomeDude from 'src/app/chars/commoners/some-dude';
import Merchant from 'src/app/chars/merchants/basic';

import SpriteHuman from 'src/app/sprites/human';
import SpriteBattle from 'src/app/sprites/battle';
import MapBattle from 'src/app/maps/battle';

class Battle extends Phaser.State {
  private hero: Hero;
  private enemy: SomeDude;

  private cursor: Phaser.Plugin.Isometric.Point3;
  private keys: { [key:string]: Phaser.Key };
  private map: MapBattle;

  private debug: boolean = false;

  constructor() {
    super();
  }

  preload() {
    // load all the sprites assets
    SpriteHuman.loadAssets(this.game);
    MapBattle.loadAssets(this.game);

    // Add and enable the plug-in.
    this.game.plugins.add(Phaser.Plugin.Isometric);
    this.game.time.advancedTiming = true; // for physics, i'm still not sure what is the use yet
    this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

    // adjust the anchors of the sprites
    // these numbers are really from trial and error, could be improved
    this.game.iso.anchor.setTo(0.5, 0.2);
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
      l: this.game.input.keyboard.addKey(Phaser.Keyboard.L),
      o: this.game.input.keyboard.addKey(Phaser.Keyboard.O),
      ',': this.game.input.keyboard.addKey(Phaser.Keyboard.COMMA),
      '.': this.game.input.keyboard.addKey(Phaser.Keyboard.PERIOD),
    };

    this.map = new MapBattle(this.game);

    this.hero = new Hero({
      x: 5,
      y: 3,
      game: this.game,
      group: this.map.group,
      map: this.map,
      movement: {
        type: 'keys',
        input: this.keys,
      },
      controls: this.keys,
      initFrame: 'left',
    });

    new SomeDude({
      x: 1,
      y: 4,
      game: this.game,
      group: this.map.group,
      map: this.map,
      hero: this.hero,
      initFrame: 'right',
    });

    new SomeDude({
      x: 2,
      y: 3,
      game: this.game,
      group: this.map.group,
      map: this.map,
      hero: this.hero,
      initFrame: 'right',
    });

    new SomeDude({
      x: 1,
      y: 2,
      game: this.game,
      group: this.map.group,
      map: this.map,
      hero: this.hero,
      initFrame: 'right',
    });

    new SpriteBattle({
      id: 'battle',
      game: this.game,
      subject: this.hero,
    });
  }

  update() {
    // project the current mouse from x/y position to x/y/z position of the isometric map, into this.cursor
    this.game.iso.unproject(this.game.input.activePointer.position, this.cursor);
  }

  render() {
    if (this.debug) {
    }
  }
}

export default Battle;
