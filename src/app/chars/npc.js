import Player from './player';

// todo: find a way to extract this out of the class component
import { TILESIZE } from '../maps/default';

class Npc extends Player {
  constructor({ game, group, map }) {
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
      map,
    });

    this.index = 0;
    this.forward = true;
    this.track = track;
  }

  moveTrack(player) {
    setTimeout(() => {
      let nextPosX = this.track[this.index][0];
      let nextPosY = this.track[this.index][1];

      const playerX = Math.ceil(player.currPos().x);
      const playerY = Math.ceil(player.currPos().y);

      if (nextPosX === playerX && nextPosY === playerY) {
        if (nextPosX === playerX) {
          nextPosX -= 1;
        } else if (nextPosY === playerY) {
          nextPosY -= 1;
        }
      }

      this.move({
        x: nextPosX,
        y: nextPosY,
        check: (x, y) => {
          const isColliding = x === playerX && y === playerY;

          // wait one sec then continue moving as per usual
          if (isColliding) this.moveTrack(player);
          return isColliding;
        },
        done: () => {
          this.setNextIndex();
          this.moveTrack(player);
        },
      });
    }, 2000);
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
