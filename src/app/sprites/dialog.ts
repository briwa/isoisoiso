import Phaser from 'phaser-ce';

import MenuSprite, { Option } from 'src/app/sprites/menu';

import Npc from 'src/app/chars/base/npc';
import Hero from 'src/app/chars/hero';

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
  hero: Hero;
  npc: Npc;
  dialog: Dialog;
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
  private subject: Hero;
  private npc: Npc;

  public sprite: Phaser.Sprite;
  public id: string = null;

  static loadAssets(game: Phaser.Game) {
    // no need sprite for now
  }

  constructor({ game, hero, npc, dialog }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.game = game;
    this.subject = hero;
    this.npc = npc;
    this.id = dialog.id;

    // let hero know that it's viewing this dialog
    this.subject.setView(this.id);
    if (this.npc) {
      this.npc.setView(this.id);
    }

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

    this.conversations = dialog.conversations;

    // styles
    const nameStyle = { font: '12px Arial', fill: '#CCCCCC' };
    const convoStyle = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };

    this.nameText = this.game.make.text(marginLeft, nameTop, (npc ? npc.name : hero.name), nameStyle);
    this.convoText = this.game.make.text(marginLeft, convoTop, '', convoStyle);
    this.convoText.lineSpacing = lineSpacing; // the default line spacing was way too big for this font size

    this.sprite.addChild(this.nameText);
    this.sprite.addChild(this.convoText);

    // listen to keys
    this.subject.listen( 'action', () => {
      // do not proceed if it's not viewing this one
      if (this.subject.getView() === this.id) {
        this.nextConvo();
      }
    });

    this.sprite.events.onDestroy.add(() => {
      // TODO: see if this can be taken out and done in npc
      if (this.npc) {
        this.npc.doneView();
        this.npc.contact = false; // some npc stays in contact (like stationary ones), so force no contact
      }

      // done listening to this dialog
      this.subject.doneView();
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
      this.convoText.text = '';
      this.menu = new MenuSprite({
        id: current.id,
        game: this.game,
        parent: this.sprite,
        subject: this.subject,
        options: current.options,
        label: current.text,
      });
      this.menu.sprite.y = 24; // TODO: manual adjustment! maybe handle this in the child instead?

      this.menu.onSelecting((selected) => {
        this.menu.doneSelecting();
        this.conversations = current.answers[selected.answer];
        this.nextConvo();
      });
    }
  }

  onDone(cb) {
    this.sprite.events.onDestroy.add(cb);
  }
}

export default SpriteDialog;
