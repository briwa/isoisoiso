import Phaser from 'phaser-ce';

interface UIConfig {
  id: string;
  subject: any;
  game: Phaser.Game;
  sprite?: Phaser.Sprite;
  parent?: Phaser.Sprite;
  children?: any;
};

// TODO: for now
interface UIChildren extends UIBase {
  [key:string]: any;
}

class UIBase {
  private subject;
  private signals: { [name: string]: Phaser.Signal } = {};

  public id: string;
  public sprite: Phaser.Sprite;
  public children: { [name: string]: UIChildren } = {};

  constructor(config: UIConfig) {
    this.id = config.id;
    this.subject = config.subject;

    if (config.sprite) {
      this.sprite = config.sprite;
    } else {
      this.sprite = config.game.make.sprite(0, 0);
    }

    if (config.parent) {
      config.parent.addChild(this.sprite);
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
          parent: this.sprite,
        });
      }
    }

    // TODO: make sure that all data is clean upon destroyed
    this.sprite.events.onDestroy.addOnce(() => {
      this.dispose();
    });
  }

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

  show(focus = true) {
    if (!this.sprite.visible) {
      this.toggle(true);
      if (focus) this.focus();

      this.emit('show');
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false)
      this.blur();

      this.emit('hide');
    }
  }

  focus() {
    this.subject.view = this.id;
  }

  blur() {
    this.subject.doneView();
  }

  toggle(toggle) {
    this.sprite.visible = toggle;
  }
}

export default UIBase;

/*
// battle/index.ts
const actions = new UIActions();
const selector = new UISelector();
const heroesStats = new UIHeroesStats();
const enemiesStats = new UIEnemiesStats();

const battle = new UIBattle({
  children: {
    actions,
    selector,
    heroesStats,
    enemiesStats
  },
});

battle.on('actions', (resp) => {
  battle.heroActions(resp)
    .then((sth) => {
      battle.next();
    });
});

// battle/actions.ts

this.on('select', (resp) => {
  this.emit('actions', resp);
});

*/
