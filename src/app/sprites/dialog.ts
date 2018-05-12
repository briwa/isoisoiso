import Phaser from 'phaser-ce';

import MenuSprite from './menu';

import Npc from '../chars/npc';
import Hero from '../chars/hero';

interface Config {
  game: Phaser.Game;
  npc: Npc;
  hero: Hero;
};

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
    game.load.spritesheet('dialog', 'assets/images/dialog-black.png', 319, 78);
  }

  constructor({ game, npc, hero }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    this.game = game;
    this.npc = npc;
    this.hero = hero;

    this.sprite = game.world.create((game.world.bounds.width / 2) - (319/2), game.world.bounds.height / 2, 'dialog', 0);
    this.conversations = this.npc.conversations;

    this.nameText = this.game.make.text(12, 9, npc.name, { font: '12px Arial', fill: '#CCCCCC' });
    this.convoText = this.game.make.text(12, 24, '', { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width });

    this.sprite.addChild(this.nameText);
    this.sprite.addChild(this.convoText);

    // this.nameText.visible = false;
    // this.convoText.visible = false;

    // const menu = new MenuSprite({
    //   game,
    //   parent: this.sprite,
    //   controls: this.hero.controls,
    //   options: ['Yes', 'No'],
    // });

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
        const menu = this.menu;
        this.conversations = this.conversations.find(convo => convo.id === menu.selection.nextId).conversations;
        menu.sprite.destroy();

        this.nextConvo();
      } else {
        this.convoText.text = '';
        this.menu = new MenuSprite({
          game: this.game,
          parent: this.sprite,
          controls: this.hero.controls,
          options: current.options,
          id: current.id,
        });
      }
    }
  }
}

export default DialogSprite;
