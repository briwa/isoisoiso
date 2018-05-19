// TODO:
// - review the process on who should be listening to the select event, should we listen to hero 'action', or this should have its own listener?
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
  parent: Phaser.Sprite;
  options: Option[];
  subject: Human;
  label?: string;
};

const lineHeight = 15;
const marginTop = 0;
const marginLeft = 24;
const cursorLeft = 12;
const cursorTop = 0;

class MenuSprite {
  private game: Phaser.Game;
  private parent: Phaser.Sprite;
  private options: Option[];
  private subject: Human;
  private group: Phaser.Sprite;
  private cursor: Phaser.Text;
  private cursorTop = cursorTop;
  private cursorLeft = cursorLeft;

  public id: string;
  public selection;
  public sprite: Phaser.Sprite;
  public signals: { [key: string]: Phaser.Signal } = {};
  public selectedIndex = 0;

  constructor({ game, subject, parent, id, label, options }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.id = id;
    this.game = game;
    this.parent = parent;
    this.subject = subject;

    this.subject.setView(id);

    // styles
    const optionStyle = { font: '12px Arial', fill: '#FFFFFF' };
    const labelStyle = { font: '12px Arial', fill: '#CCCCCC' };

    // visual cues
    this.options = options;
    this.sprite = this.game.add.sprite();

    const allText = label ? [{name: label, label: true}, ...this.options] : this.options;
    const allTextSprite = allText.map((option, idx) => {
      return this.game.make.text(
        marginLeft, (idx * lineHeight) + marginTop,
        option.name,
        option.label ? labelStyle : optionStyle,
      );
    });

    this.cursorTop = label ? this.cursorTop + lineHeight : this.cursorTop;
    this.cursor = this.game.make.text(this.cursorLeft, this.cursorTop, '>', optionStyle);

    allTextSprite.concat([this.cursor]).forEach((text) => {
      this.sprite.addChild(text);
    });

    // make it visible in the parent
    parent.addChild(this.sprite);

    // publish events
    this.signals.selection = new Phaser.Signal();
    this.signals.doneSelecting = new Phaser.Signal();
    this.signals.selection.add(this.updateCursor, this);

    // subscribe to events
    this.subject.listen('up', () => {
      this.prev();
    });
    this.subject.listen('down', () => {
      this.next();
    });
    this.subject.listen('action', () => {
      this.signals.doneSelecting.dispatch();
    });
  }

  prev() {
    if (this.subject.getView() === this.id) {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      this.signals.selection.dispatch();
    }
  }

  next() {
    if (this.subject.getView() === this.id) {
      this.selectedIndex = Math.min(this.selectedIndex + 1, this.options.length - 1);
      this.signals.selection.dispatch();
    }
  }

  updateCursor() {
    this.cursor.y = (this.selectedIndex * lineHeight) + this.cursorTop;
  }

  onChange(callback) {
    this.signals.selection.add(callback);
  }

  onSelecting(callback) {
    this.signals.doneSelecting.add(() => {
      if (this.subject.getView() === this.id) {
        callback(this.options[this.selectedIndex]);
      }
    });
  }

  doneSelecting() {
    this.subject.doneView();
    this.signals.selection.removeAll();
    this.signals.doneSelecting.removeAll();
    this.sprite.destroy();
  }
}

export default MenuSprite;
