import Phaser from 'phaser-ce';

interface Config {
  game: Phaser.Game;
  message: string[];
};

class MessageSprite {
  private game: Phaser.Game;
  private text: Phaser.Text;

  public sprite: Phaser.Sprite;

  static loadAssets(game: Phaser.Game) {
    // https://opengameart.org/content/isometric-people
    game.load.spritesheet('message', 'assets/images/message-black.png', 319, 78);
  }

  constructor({ game, message }: Config) {
    // TODO: we did this because when testing, we can't the phaser side of things yet. find out how
    if (!game) return;

    this.game = game;

    this.sprite = game.world.create((game.world.bounds.width / 2) - (319/2), game.world.bounds.height / 2, 'message', 0);
    this.text = this.game.make.text(12,9, message[0], { font: '14px Arial', fill: '#FFFFFF', wordWrap: true, wordWrapWidth: 319 });
    this.sprite.addChild(this.text);
  }
}

export default MessageSprite;
