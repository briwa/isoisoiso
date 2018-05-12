import Phaser from 'phaser-ce';

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
    this.convoText = this.game.make.text(12, 24, this.conversations[0], { font: '12px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: this.sprite.width });

    this.sprite.addChild(this.nameText);
    this.sprite.addChild(this.convoText);

    this.npc.paused = true;
    this.hero.paused = true;

    // listen to keys
    this.hero.controls.p.onDown.add(this.nextConvo, this);
  }

  nextConvo() {
    this.conversations = this.conversations.slice(1);
    if (this.conversations.length > 0) {
      this.convoText.text = this.conversations[0];
      return this;
    }

    this.npc.paused = false;
    this.hero.paused = false;
    this.hero.controls.p.onDown.remove(this.nextConvo, this);
    this.sprite.destroy();
    return null;
  }
}

export default DialogSprite;
