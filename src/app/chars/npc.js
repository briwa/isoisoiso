import Player from './player';

// todo: find a way to extract this out of the class component
import { TILESIZE } from '../maps/default';

class Npc extends Player {
  constructor({ game, group }) {
    const track = [
      [1, 3],
      [7, 3],
    ];

    const z = 0;
    const sprite = 'people';
    const delimiter = 129;

    super({
      game,
      x: track[0][0] * TILESIZE,
      y: track[0][1] * TILESIZE,
      z,
      sprite,
      delimiter,
      group,
    });

    this.index = 0;
    this.forward = true;
    this.track = track;
  }

  moveTrack(grid, player) {
    this.move({
      x: this.track[this.index][0],
      y: this.track[this.index][1],
      grid,
      check: (x, y) => {
        const playerX = Math.ceil(player.isoPosition.x / TILESIZE);
        const playerY = Math.ceil(player.isoPosition.y / TILESIZE);
        const isColliding = x === playerX && y === playerY;

        // wait one sec then continue moving as per usual
        if (isColliding) {
          setTimeout(() => {
            this.moveTrack(grid, player);
          }, 1000);
        }

        return isColliding;
      },
      done: () => {
        this.setNextIndex();
        this.moveTrack(grid, player);
      },
    });
  }

  setNextIndex() {
    this.forward =
      (this.forward && !!this.track[this.index + 1]) ||
      (!this.forward && !this.track[this.index - 1]);

    if (this.forward) {
      this.index += 1;
    } else {
      this.index -= 1;
    }
  }
}

export default Npc;
