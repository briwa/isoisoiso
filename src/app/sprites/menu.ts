import Phaser from 'phaser-ce';

import Human from 'src/app/chars/base/human';

export interface Option {
  name: string;
  answer?: string;
  label?: boolean;
};

interface Config {
  id: string;
  game: Phaser.Game;
  parent: Phaser.Sprite | Phaser.Group;
  subject: Human;
};

const lineHeight = 15;
const marginTop = 0;
const marginLeft = 24;
const cursorLeft = 12;
const cursorTop = 0;

class SpriteMenu {
  private game: Phaser.Game;
  private parent: Phaser.Sprite | Phaser.Group;
  private options: Option[];
  private subject: Human;
  private optionText: Phaser.Group;
  private cursor: Phaser.Text;
  private label: string;
  private labelText: Phaser.Text;
  private cursorTop = cursorTop;
  private cursorLeft = cursorLeft;

  public id: string;
  public selection;
  public sprite: Phaser.Sprite;
  public signals: { [key: string]: Phaser.Signal } = {};
  public selectedIndex = 0;

  constructor({ id, game, subject, parent }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.game = game;
    this.parent = parent;
    this.subject = subject;
    this.id = id;

    // visual cues
    this.sprite = this.game.make.sprite(0, 0);
    this.parent.addChild(this.sprite);
    this.toggle(false);

    // create local listeners
    this.signals.start = new Phaser.Signal();
    this.signals.done = new Phaser.Signal();
    this.signals.selection = new Phaser.Signal();
    this.signals.selecting = new Phaser.Signal();
    this.signals.cancel = new Phaser.Signal();
    this.signals.selection.add(this.updateCursor, this);

    // subscribe to events
    this.subject.listen('up', this.prev, this);
    this.subject.listen('down', this.next, this);
    this.subject.listen('action', this.selecting, this);
    this.subject.listen('cancel', this.cancel, this);
    this.sprite.events.onDestroy.addOnce(() => {
      // remove local listeners
      this.signals.start.removeAll();
      this.signals.done.removeAll();
      this.signals.selection.removeAll();
      this.signals.selecting.removeAll();
      this.signals.cancel.removeAll();

      // remove subject listeners
      this.subject.removeListener('up', this.prev, this);
      this.subject.removeListener('down', this.next, this);
      this.subject.removeListener('action', this.selecting, this);
      this.subject.removeListener('cancel', this.cancel, this);
    });
  }

  get selected() {
    const option = this.options[this.selectedIndex];
    // TODO: seems like this was incorrectly typed by Phaser to pixi.displayObject
    // where it was supposed to be just Phaser.Sprite, hence missing properties
    // type it to any for now
    const text: any = this.optionText.children[this.selectedIndex];

    return {
      ...option,
      x: text.x,
      y: text.y,
      width: text.width,
      height: lineHeight,
    };
  }

  createOptions(options: Option[], label?: string, ) {
    this.label = label;
    this.options = options;

    // clean up text children
    // TODO: review why we can't use the Phaser.Text type, instead having to fallback to any
    while (this.sprite.children.length) {
      const text: any = this.sprite.children[0];
      this.sprite.removeChild(text)
      text.destroy();
    }

    // recreating the group
    this.optionText = this.game.add.group();
    this.sprite.addChild(this.optionText);

    // styles
    const optionStyle = { font: '12px Arial', fill: '#FFFFFF' };
    const textSprites = this.options.map((option, idx) => {
      return this.game.make.text(
        marginLeft, (idx * lineHeight) + marginTop,
        option.name,
        optionStyle,
      );
    });

    this.cursorTop = marginTop;
    this.cursor = this.game.make.text(this.cursorLeft, this.cursorTop, '>', optionStyle);

    textSprites.forEach((text) => {
      this.optionText.addChild(text);
    });

    this.sprite.addChild(this.cursor);
    this.sprite.addChild(this.optionText);
  }

  show() {
    if (!this.sprite.visible) {
      this.toggle(true);
      this.subject.view = this.id;
      this.selectIndex(0);
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

  prev() {
    this.selectIndex(this.selectedIndex - 1);
  }

  next() {
    this.selectIndex(this.selectedIndex + 1);
  }

  selectIndex(index) {
    this.selectedIndex = Math.min(Math.max(0, index), this.options.length - 1);
    this.signals.selection.dispatch();
  }

  selecting() {
    this.signals.selecting.dispatch();
  }

  cancel() {
    this.signals.cancel.dispatch();
  }

  updateCursor() {
    this.cursor.y = (this.selectedIndex * lineHeight) + this.cursorTop;
  }

  onCancel(callback) {
    this.signals.cancel.add(callback);
  }

  onChange(callback) {
    this.signals.selection.add(callback);
  }

  onSelecting(callback) {
    this.signals.selecting.add(() => {
      callback(this.selected);
    });
  }

  onDone(callback) {
    this.signals.done.addOnce(() => {
      callback();
    });
  }
}

export default SpriteMenu;
