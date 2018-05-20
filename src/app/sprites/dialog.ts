import Phaser from 'phaser-ce';

import MenuSprite, { Option } from 'src/app/sprites/menu';

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
  private subject: Human;
  private response: any = null; // TODO: type this

  public id: string = null;
  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // no need sprite for now
  }

  constructor({ game, subject, label, dialog }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.game = game;
    this.subject = subject;
    this.id = dialog.id;

    // let hero know that it's viewing this dialog
    this.subject.setView(this.id);

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

    this.nameText = this.game.make.text(marginLeft, nameTop, label, nameStyle);
    this.convoText = this.game.make.text(marginLeft, convoTop, '', convoStyle);
    this.convoText.lineSpacing = lineSpacing; // the default line spacing was way too big for this font size

    this.sprite.addChild(this.nameText);
    this.sprite.addChild(this.convoText);

    this.subject.listen( 'action', this.nextConvo, this);

    // trigger the first conversation
    this.nextConvo();
  }

  nextConvo() {
    // check if we can proceed
    if (this.subject.getView() !== this.id) return;

    const current = this.conversations[0];
    if (!current) {
      this.done();
      return;
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

        if (current.answers) {
          this.conversations = current.answers[selected.answer];
          this.nextConvo();
        } else {
          this.response = selected.answer;
          this.done();
        }
      });
    }
  }

  done() {
    this.subject.doneView();
    this.subject.removeListener('action', this.nextConvo, this);

    this.sprite.destroy();
  }

  onDone(callback) {
    this.sprite.events.onDestroy.addOnce(() => {
      callback(this.response);
    });
  }
}

export default SpriteDialog;
