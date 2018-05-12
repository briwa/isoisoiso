import Phaser from 'phaser-ce';

import Hero from 'src/app/chars/hero';

interface Config {
  game: Phaser.Game;
  parent: Phaser.Sprite;
  subject?: Hero;
  id: number;
  label?: string;
  options: { confirm: boolean, name: string, label?: boolean }[];
  onSelect?: (subject: Hero, option: any) => number;
};

const lineHeight = 15;
const marginLeft = 24;
const marginTop = 24;
const cursorLeft = 12;
const cursorTop = 24;

class MenuSprite {
  private game: Phaser.Game;
  private parent: Phaser.Sprite;
  private options: { confirm: boolean, name: string, label?: boolean }[];
  private onSelect: any;
  private subject: any;
  private selectedIndex = 0;
  private group: Phaser.Sprite;
  private cursor: Phaser.Text;

  public id: number;
  public selection;
  public sprite: Phaser.Sprite;

  private cursorTop = cursorTop;
  private cursorLeft = cursorLeft;

  constructor({ game, subject, parent, id, label, options, onSelect }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.game = game;
    this.parent = parent;
    this.id = id;
    this.onSelect = onSelect;
    this.subject = subject;

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

    // listen to keys
    this.subject.controls.s.onDown.add(this.next, this);
    this.subject.controls.w.onDown.add(this.prev, this);

    this.sprite.events.onDestroy.add(() => {
      this.subject.controls.s.onDown.remove(this.next, this);
      this.subject.controls.w.onDown.remove(this.prev, this);
    });
  }

  prev() {
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    this.cursor.y = (this.selectedIndex * lineHeight) + this.cursorTop;
  }

  next() {
    this.selectedIndex = Math.min(this.selectedIndex + 1, this.options.length - 1);
    this.cursor.y = (this.selectedIndex * lineHeight) + this.cursorTop;
  }

  select() {
    return this.onSelect(this.subject, this.options[this.selectedIndex]);
  }
}

export default MenuSprite;
