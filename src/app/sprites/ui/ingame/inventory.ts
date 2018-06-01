import Phaser from 'phaser-ce';

import UIBase from 'src/app/sprites/ui/base';
import UIToggle from 'src/app/sprites/ui/base/toggle';
import UIMenu from 'src/app/sprites/ui/menu';
import UIActions from 'src/app/sprites/ui/ingame/actions';
import Hero from 'src/app/chars/hero';

interface Config {
  id: string;
  game: Phaser.Game;
  parent: UIBase;
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

interface Children {
  items: UIMenu;
  itemActions: UIActions;
};

class UIInventory extends UIToggle<Children> {
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
        itemActions: UIActions,
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

      if (this.subject.inventory.length === 0) {
        this.noItems.visible = true;
        this.children.items.toggle(false);
      } else {
        this.noItems.visible = false;
        this.children.items.toggle(true);
      }
    });
  }

  repopulateItems() {
    this.children.items.createOptions(this.subject.inventory); // repopulate list after discard
  }
}

export default UIInventory;
