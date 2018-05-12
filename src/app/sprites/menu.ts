import Phaser from 'phaser-ce';

interface Config {
  id: number;
  game: Phaser.Game;
  options: { nextId: number, text: string }[];
  controls: { [key:string]: Phaser.Key };
  parent: Phaser.Sprite;
};

class MenuSprite {
  private game: Phaser.Game;
  private parent: Phaser.Sprite;
  private controls: { [key:string]: Phaser.Key };
  private options: { nextId: number, text: string }[];
  private selectedIndex = 0;
  private group: Phaser.Sprite;
  private cursor: Phaser.Text;

  public id: number;
  public selection;
  public sprite: Phaser.Sprite;

  constructor({ game, id, options, controls, parent }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    this.game = game;
    this.parent = parent;
    this.controls = controls;
    this.id = id;

    // visual cues
    this.options = options;
    this.sprite = this.game.add.sprite();
    const style = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.parent.width };

    const optionsText = this.options.map((option, idx) => {
      return this.game.make.text(20, (idx * 15) + 24, option.text, style);
    });

    this.cursor = this.game.make.text(12, 24, '>', style);

    optionsText.concat([this.cursor]).forEach((text) => {
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
    this.cursor.y = (this.selectedIndex * 15) + 24;
    this.selection = this.options[this.selectedIndex];
  }

  next() {
    this.selectedIndex = Math.min(this.selectedIndex + 1, this.options.length - 1);
    this.cursor.y = (this.selectedIndex * 15) + 24;
    this.selection = this.options[this.selectedIndex];
  }
}

export default MenuSprite;
