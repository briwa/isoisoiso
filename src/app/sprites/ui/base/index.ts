import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';

interface UIConfig {
  id: string;
  subject: any;
  game: Phaser.Game;
  sprite?: Phaser.Sprite;
  parent?: UIBase;
  children?: any;
};

// TODO: for now
interface UIChildren extends UIBase {
  [key:string]: any;
}

class UIBase {
  private signals: { [name: string]: Phaser.Signal } = {};
  protected subject: Hero;

  id: string;
  sprite: Phaser.Sprite;
  children: { [name: string]: UIChildren } = {};

  constructor(config: UIConfig) {
    this.id = config.id;
    this.subject = config.subject;

    if (config.sprite) {
      this.sprite = config.sprite;
    } else {
      this.sprite = config.game.make.sprite(0, 0);
    }

    if (config.parent) {
      config.parent.sprite.addChild(this.sprite);
    } else {
      config.game.world.addChild(this.sprite);
    }

    if (config.children) {
      for (const key in config.children) {
        const Children = config.children[key];

        this.children[key] = new Children({
          id: `${config.id}-${key}`, // TODO: this might not be correct
          subject: config.subject,
          game: config.game,
          parent: this,
        });
      }
    }

    // TODO: make sure that all data is clean upon destroyed
    this.sprite.events.onDestroy.addOnce(() => {
      this.dispose();
    });
  }

  // Event-related
  on(name: string, callback: Function, context?: any) {
    if (!this.signals[name]) {
      this.signals[name] = new Phaser.Signal();
    }

    this.signals[name].add(callback, context || this);
  }

  once(name: string, callback: Function, context?: any) {
    if (!this.signals[name]) {
      this.signals[name] = new Phaser.Signal();
    }

    this.signals[name].addOnce(callback, context || this)
  }

  emit(name: string, args?: any) {
    if (!this.signals[name]) {
      this.signals[name] = new Phaser.Signal();
    }

    this.signals[name].dispatch(args);
  }

  dispose() {
    for (const key in this.signals) {
      this.signals[key].dispose();
    }
  }

  // UI-related
  toggle(toggle) {
    this.sprite.visible = toggle;
  }
}

export default UIBase;
