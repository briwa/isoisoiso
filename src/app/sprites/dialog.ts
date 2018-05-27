import Phaser from 'phaser-ce';

import SpriteMenu, { Option } from 'src/app/sprites/menu';

import Human from 'src/app/chars/base/human';

export interface Dialog {
  id: string;
  conversations: Conversation[];
};

interface Conversation {
  id: string;
  type: string;
  text?: string;
  options?: Option[];
  answers?: { [key: string]: Conversation[] };
};

interface Config {
  game: Phaser.Game;
  subject: Human;
  dialog: Dialog;
  label?: string;
  immediate?: boolean;
};

const width = 400;
const height = 100;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;

class SpriteDialog {
  private game: Phaser.Game;
  private nameText: Phaser.Text;
  private convoText: Phaser.Text;
  private menu: SpriteMenu;
  private conversations: Conversation[];
  private signals: { [key:string]: Phaser.Signal } = {};
  private response: string = null; // TODO: type this
  private index: number = 0;

  public id: string = null;
  public subject: Human;
  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // no need sprite for now
  }

  constructor({ game, subject, label, dialog, immediate }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = dialog.id;
    this.game = game;
    this.subject = subject;

    var graphics = this.game.add.graphics(0, 0);

    // set a fill and line style
    graphics.beginFill(0x333333);
    graphics.lineStyle(3, 0xdddddd, 1);

    // draw a shape
    graphics.moveTo(0,0);
    graphics.lineTo(width, 0);
    graphics.lineTo(width, height);
    graphics.lineTo(0, height);
    graphics.lineTo(0, 0);
    graphics.endFill();

    this.sprite = game.world.create((game.world.bounds.width / 2) - (width / 2), game.world.bounds.height / 2, graphics.generateTexture());
    graphics.destroy();
    this.toggle(false);

    this.menu = new SpriteMenu({
      game: this.game,
      parent: this.sprite,
      subject: this.subject,
    });
    this.menu.sprite.y = 24; // TODO: manual adjustment! maybe handle this in the child instead?

    this.conversations = dialog.conversations;

    // styles
    const nameStyle = { font: '12px Arial', fill: '#CCCCCC' };
    const convoStyle = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };

    this.nameText = this.game.make.text(marginLeft, nameTop, label, nameStyle);
    this.convoText = this.game.make.text(marginLeft, convoTop, '', convoStyle);
    this.convoText.lineSpacing = lineSpacing; // the default line spacing was way too big for this font size

    this.sprite.addChild(this.nameText);
    this.sprite.addChild(this.convoText);

    // create local listeners
    this.signals.start = new Phaser.Signal();
    this.signals.done = new Phaser.Signal();

    // listening
    this.subject.listen( 'action', this.nextConvo, this);
    this.signals.start.add(() => {
      this.conversations = dialog.conversations;
      this.nextConvo();
    });
    this.sprite.events.onDestroy.addOnce(() => {
      this.subject.removeListener('action', this.nextConvo, this);
      this.signals.start.removeAll();
      this.signals.done.removeAll();
      this.signals.reload.removeAll();
    });

    // open immediately
    if (immediate) {
      this.show();

      // also close immediately
      this.onDone(() => {
        this.hide();
      });
    }
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.subject.view = this.id;
      this.signals.start.dispatch();
    }
  }

  hide() {
    if (this.sprite.visible) {
      this.toggle(false);
      this.subject.doneView();
    }
  }

  toggle(toggle) {
    this.sprite.visible = toggle;
  }

  nextConvo() {
    // check if's being viewed
    if (this.subject.view !== this.id) {
      return;
    }

    const current = this.conversations[0];
    if (!current) {
      this.signals.done.dispatch();
      return;
    }

    if (current.type === 'dialog') {
      this.convoText.text = this.conversations[0].text;
      this.conversations = this.conversations.slice(1);
    } else if (current.type === 'menu') {
      this.convoText.text = '';
      this.menu.createOptions(current.id, current.options, current.text);
      this.menu.show();

      this.menu.onSelecting((selected) => {
        this.menu.hide();

        if (current.answers) {
          this.conversations = current.answers[selected.answer];
        } else {
          this.response = selected.answer;
          this.signals.done.dispatch();
        }
      });
    }
  }

  onDone(callback) {
    this.signals.done.addOnce(() => {
      callback(this.response);
    });
  }
}

export default SpriteDialog;
