import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui/base';
import Human from 'src/app/chars/base/human';

export interface Option {
  name: string;
  answer?: string;
  label?: boolean;
};

interface Config {
  id: string;
  game: Phaser.Game;
  parent: UIBase;
  subject: Human;
};

const lineHeight = 15;
const marginTop = 0;
const marginLeft = 24;
const cursorLeft = 12;
const cursorTop = 0;

class UIMenu extends UIBase {
  private game: Phaser.Game;
  private options: Option[];
  private optionText: Phaser.Group;
  private cursor: Phaser.Text;
  private label: string;
  private labelText: Phaser.Text;
  private parent: UIBase;
  private cursorTop = 0;
  private cursorLeft = 12;

  selection;
  selectedIndex = 0;

  constructor(config: Config) {
    super({
      id: config.id,
      game: config.game,
      subject: config.subject,
      parent: config.parent,
    });

    this.game = config.game;
    this.parent = config.parent;
    this.on('selection', this.updateCursor);

    // subscribe to events
    config.subject.listen('up', this.prev, this, this.parent.id);
    config.subject.listen('down', this.next, this, this.parent.id);
    config.subject.listen('action', this.selecting, this, this.parent.id);
    config.subject.listen('cancel', this.cancel, this, this.parent.id);

    this.sprite.events.onDestroy.addOnce(() => {
      // remove subject listeners
      config.subject.removeListener('up', this.prev, this);
      config.subject.removeListener('down', this.next, this);
      config.subject.removeListener('action', this.selecting, this);
      config.subject.removeListener('cancel', this.cancel, this);
    });
  }

  get selected() {
    const option = this.options[this.selectedIndex];

    // there are cases where selection is simply not available
    if (!option) {
      return null;
    }

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

  createOptions(options: Option[], label?: string) {
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

    // reset selection
    // TODO: this could've been smarter by find the possible selection after recreating options
    // e.g. if the selection still exists, select them, else move one selection up/down
    this.selectIndex(0);
  }

  prev() {
    this.selectIndex(this.selectedIndex - 1);
  }

  next() {
    this.selectIndex(this.selectedIndex + 1);
  }

  selectIndex(index) {
    this.selectedIndex = Math.min(Math.max(0, index), this.options.length - 1);
    this.emit('selection')
  }

  selecting() {
    if (this.selected) this.emit('selecting', this.selected);
  }

  cancel() {
    this.emit('cancel');
  }

  updateCursor() {
    this.cursor.y = (this.selectedIndex * lineHeight) + this.cursorTop;
  }
}

export default UIMenu;
