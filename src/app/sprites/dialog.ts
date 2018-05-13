import Phaser from 'phaser-ce';

import MenuSprite, { Option } from 'src/app/sprites/menu';

import Npc from 'src/app/chars/base/npc';
import Hero from 'src/app/chars/hero';

export interface Conversation {
  id: string;
  type: string;
  text?: string;
  options?: Option[];
  onSelect?: (subject: Hero, option: Option) => string;
  answers?: { [key: string]: Conversation[] };
};

interface Config {
  game: Phaser.Game;
  hero: Hero;
  npc: Npc;
  conversations: Conversation[];
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
  private menu: MenuSprite;
  private conversations: Conversation[];
  private npc: Npc;
  private hero: Hero;

  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // no need sprite for now
  }

  constructor({ game, hero, npc, conversations }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.game = game;
    this.hero = hero;
    this.npc = npc;

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

    this.conversations = conversations;

    // styles
    const nameStyle = { font: '12px Arial', fill: '#CCCCCC' };
    const convoStyle = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };

    this.nameText = this.game.make.text(marginLeft, nameTop, (npc ? npc.name : hero.name), nameStyle);
    this.convoText = this.game.make.text(marginLeft, convoTop, '', convoStyle);
    this.convoText.lineSpacing = lineSpacing; // the default line spacing was way too big for this font size

    this.sprite.addChild(this.nameText);
    this.sprite.addChild(this.convoText);

    this.hero.paused = true;
    if (this.npc) this.npc.paused = true;

    // listen to keys
    this.hero.controls.p.onDown.add(this.nextConvo, this);

    this.sprite.events.onDestroy.add(() => {
      this.hero.paused = false;
      if (this.npc) {
        this.npc.paused = false;
        this.npc.contact = false; // some npc stays in contact (like stationary ones), so force no contact
      }

      this.hero.controls.p.onDown.remove(this.nextConvo, this);
    }, this);

    this.nextConvo();
  }

  nextConvo() {
    const current = this.conversations[0];
    if (!current) {
      this.sprite.destroy();
      return null;
    }

    if (current.type === 'dialog') {
      this.convoText.text = this.conversations[0].text;
      this.conversations = this.conversations.slice(1);
    } else if (current.type === 'menu') {
      // coming from pressing 'action', so it's a selection of the same menu
      if (this.menu && this.menu.id === current.id) {
        // get the next convo id
        const answerId = this.menu.select();
        this.conversations = current.answers[answerId];
        this.menu.sprite.destroy();

        this.nextConvo();
      } else {
        this.convoText.text = '';
        this.menu = new MenuSprite({
          game: this.game,
          parent: this.sprite,
          subject: this.hero,
          onSelect: current.onSelect,
          options: current.options,
          label: current.text,
          id: current.id,
        });
        this.menu.sprite.y = 24; // TODO: manual adjustment! maybe handle this in the child instead?
      }
    }
  }

  onDone(cb) {
    this.sprite.events.onDestroy.add(cb);
  }
}

export default SpriteDialog;
