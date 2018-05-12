import Phaser from 'phaser-ce';

import MenuSprite from './menu';

import Npc from 'src/app/chars/base/npc';
import Hero from 'src/app/chars/hero';

interface Config {
  game: Phaser.Game;
  npc: Npc;
  hero: Hero;
};

const width = 319;
const height = 78;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;

class DialogSprite {
  private game: Phaser.Game;
  private nameText: Phaser.Text;
  private convoText: Phaser.Text;
  private menu: MenuSprite;
  private conversations: any[];
  private npc: Npc;
  private hero: Hero;

  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // https://opengameart.org/content/isometric-people
    game.load.spritesheet('dialog', 'assets/images/dialog-black.png', width, height);
  }

  constructor({ game, npc, hero }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    // setup
    this.game = game;
    this.npc = npc;
    this.hero = hero;

    this.sprite = game.world.create((game.world.bounds.width / 2) - (width / 2), game.world.bounds.height / 2, 'dialog', 0);
    this.conversations = this.npc.conversations;

    // styles
    const nameStyle = { font: '12px Arial', fill: '#CCCCCC' };
    const convoStyle = { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width };

    this.nameText = this.game.make.text(marginLeft, nameTop, npc.name, nameStyle);
    this.convoText = this.game.make.text(marginLeft, convoTop, '', convoStyle);

    this.sprite.addChild(this.nameText);
    this.sprite.addChild(this.convoText);

    this.npc.paused = true;
    this.hero.paused = true;

    // listen to keys
    this.hero.controls.p.onDown.add(this.nextConvo, this);
    this.nextConvo();
  }

  showConvo(text) {
    this.convoText.text = text;
  }

  nextConvo() {
    const current = this.conversations[0];
    if (!current) {
      this.npc.paused = false;
      this.hero.paused = false;
      this.hero.controls.p.onDown.remove(this.nextConvo, this);
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
        const nextId = this.menu.selection.nextId;

        // i can't simply use .find here because tslint is targetting es5
        // if i changed it to es6, uglifier will break since it takes in es5 as input
        // so we'll stick with .filter[0] for now
        this.conversations = this.conversations.filter(convo => convo.id === nextId)[0].conversations;
        this.menu.sprite.destroy();

        this.nextConvo();
      } else {
        this.convoText.text = '';
        this.menu = new MenuSprite({
          game: this.game,
          parent: this.sprite,
          controls: this.hero.controls,
          options: current.options,
          label: current.text,
          id: current.id,
        });
      }
    }
  }
}

export default DialogSprite;
