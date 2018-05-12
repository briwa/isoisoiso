// TODO:
// - write down them constants into variables
import Phaser from 'phaser-ce';

interface Config {
  id: number;
  game: Phaser.Game;
  label?: string;
  options: { nextId: number, text: string, label?: boolean }[];
  controls: { [key:string]: Phaser.Key };
  parent: Phaser.Sprite;
};

const lineHeight = 15;
const marginLeft = 24;
const marginTop = 24;
const cursorLeft = 12;
const cursorTop = 24;

class MenuSprite {
  private game: Phaser.Game;
  private parent: Phaser.Sprite;
  private controls: { [key:string]: Phaser.Key };
  private options: { nextId: number, text: string, label?: boolean }[];
  private selectedIndex = 0;
  private group: Phaser.Sprite;
  private cursor: Phaser.Text;

  public id: number;
  public selection;
  public sprite: Phaser.Sprite;

  private cursorTop = cursorTop;
  private cursorLeft = cursorLeft;

  constructor({ game, id, label, options, controls, parent }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.game = game;
    this.parent = parent;
    this.controls = controls;
    this.id = id;

    // styles
    const optionStyle = { font: '12px Arial', fill: '#FFFFFF' };
    const labelStyle = { font: '12px Arial', fill: '#CCCCCC' };

    // visual cues
    this.options = options;
    this.sprite = this.game.add.sprite();

    const allText = label ? [{text: label, label: true}, ...this.options] : this.options;
    const allTextSprite = allText.map((option, idx) => {
      return this.game.make.text(
        marginLeft, (idx * lineHeight) + marginTop,
        option.text,
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
    this.controls.s.onDown.add(this.next, this);
    this.controls.w.onDown.add(this.prev, this);

    // default is selecting the first one
    this.selection = this.options[this.selectedIndex];

    this.sprite.events.onDestroy.add(() => {
      this.controls.s.onDown.remove(this.next, this);
      this.controls.w.onDown.remove(this.prev, this);
    });
  }

  prev() {
    this.selectedIndex = Math.max(0, this.selectedIndex - 1);
    this.cursor.y = (this.selectedIndex * lineHeight) + this.cursorTop;
    this.selection = this.options[this.selectedIndex];
  }

  next() {
    this.selectedIndex = Math.min(this.selectedIndex + 1, this.options.length - 1);
    this.cursor.y = (this.selectedIndex * lineHeight) + this.cursorTop;
    this.selection = this.options[this.selectedIndex];
  }
}

export default MenuSprite;
