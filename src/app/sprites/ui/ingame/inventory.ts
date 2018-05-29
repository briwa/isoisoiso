import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui';
import UIMenu from 'src/app/sprites/ui/menu';
import UIOptions from 'src/app/sprites/ui/options';
import Hero from 'src/app/chars/hero';

interface Config {
  id: string;
  game: Phaser.Game;
  parent: Phaser.Sprite;
  subject: Hero;
};

const width = 480;
const height = 400;
const marginTop = 12;
const marginLeft = 12;
const nameTop = 9;
const convoTop = 24;
const lineSpacing = -8;
const dividerLeft = 80;
const dividerTop = 50;

class UIInventory extends UIBase {
  private game: Phaser.Game;
  private noItems: Phaser.Text;

  constructor(config: Config) {
    super({
      id: config.id,
      subject: config.subject,
      game: config.game,
      parent: config.parent,
      children: {
        items: UIMenu,
        itemActions: UIOptions,
      },
    });

    // setup
    this.game = config.game;
    this.noItems = config.game.make.text(10, 0, 'No items', { font: '12px Arial', fill: '#FFFFFF' });
    this.sprite.addChild(this.noItems);
    this.sprite.x = dividerLeft;
    this.sprite.y = dividerTop;

    this.children.items.on('selecting', (response) => {
      this.children.itemActions.setActions(response);
      this.children.itemActions.show();
    });

    this.children.items.on('cancel', (response) => {
      // TODO: also major hack, fix it later
      this.children.items.toggle(true);
      this.children.items.hide();
      this.hide();
    });

    this.children.itemActions.children.menu.on('selecting', (response) => {
      const context = this.children.itemActions.context;
      switch(response.name) {
        case 'Use':
          this.subject.useItem(context);
          this.subject.discardItem(context);
          this.repopulateItems();
          break;
        case 'Discard':
          this.subject.discardItem(context);
          this.repopulateItems();
          break;
        case 'Equip':
          this.subject.equipItem(context.id);
          break;
        case 'Unequip':
          this.subject.unequipItem(context.id);
          break;
      }

      this.children.itemActions.hide();
    });

    this.children.itemActions.children.menu.on('cancel', (response) => {
      this.children.itemActions.hide();
    });

    this.on('show', () => {
      this.repopulateItems();
      this.children.items.show();

      if (this.subject.inventory.length === 0) {
        // TODO: major hack, fix it later
        this.noItems.visible = true;
        this.children.items.toggle(false);
      } else {
        this.noItems.visible = false;
      }
    });

    this.toggle(false);
  }

  repopulateItems() {
    this.children.items.createOptions(this.subject.inventory); // repopulate list after discard
  }
}

export default UIInventory;
