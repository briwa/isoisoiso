import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui';
import UIMenu, { Option } from 'src/app/sprites/ui/menu';
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
  id: string;
  game: Phaser.Game;
  subject: Human;
  dialog?: Dialog;
  label?: string;
  immediate?: boolean;
  children?: { [name: string]: UIBase };
};

const width = 400;
const height = 100;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;

class UIDialog extends UIBase {
  private nameText: Phaser.Text;
  private convoText: Phaser.Text;
  private conversations: Conversation[];
  private response: string = null; // TODO: type this
  private index: number = 0;
  private dialog: Dialog;
  private immediate: boolean = false;

  static createBase(game: Phaser.Game): Phaser.Sprite {
    const graphics = game.add.graphics(0, 0);
    graphics.beginFill(0x333333);
    graphics.lineStyle(3, 0xdddddd, 1);
    graphics.moveTo(0,0);
    graphics.lineTo(width, 0);
    graphics.lineTo(width, height);
    graphics.lineTo(0, height);
    graphics.lineTo(0, 0);
    graphics.endFill();
    const texture = graphics.generateTexture();
    graphics.destroy();

    return game.world.create(
      (game.world.bounds.width / 2) - (width / 2),
      game.world.bounds.height / 2,
      texture);
  }

  constructor(config: Config) {
    super({
      id: config.id,
      game: config.game,
      subject: config.subject,
      sprite: UIDialog.createBase(config.game),
      children: {
        menu: UIMenu,
      },
    });

    // setup
    this.dialog = config.dialog;
    this.children.menu.sprite.y = convoTop;

    // // styles
    const nameStyle = { font: '12px Arial', fill: '#CCCCCC' };
    const convoStyle = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };

    this.nameText = config.game.make.text(marginLeft, nameTop, config.label, nameStyle);
    this.convoText = config.game.make.text(marginLeft, convoTop, '', convoStyle);
    this.convoText.lineSpacing = lineSpacing; // the default line spacing was way too big for this font size

    this.sprite.addChild(this.nameText);
    this.sprite.addChild(this.convoText);

    // listening global action
    config.subject.listen( 'action', this.next, this);
    this.sprite.events.onDestroy.addOnce(() => {
      config.subject.removeListener('action', this.next, this);
    });

    // initially hidden
    this.toggle(false);
  }

  private next() {
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

      this.children.menu.createOptions(current.options, current.text);
      this.children.menu.show();

      this.children.menu.on('selecting', (selected) => {
        this.children.menu.hide();

        if (current.answers) {
          this.conversations = current.answers[selected.answer];
          this.next(); // move to the next conversation right after the selection
        } else {
          this.done(selected.answer);
        }
      });
    }
  }

  private done(response = null) {
    // only need to do this once
    if (this.immediate) {
      this.hide();
      this.immediate = false;
    }

    this.emit('done', response);
  }

  start(conversations?: Conversation[], immediate = false) {
    this.conversations = conversations || this.dialog.conversations;
    this.show();
    this.next();
    this.immediate = immediate;
  }
}

export default UIDialog;
