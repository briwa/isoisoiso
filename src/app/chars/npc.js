import Player from './player';

// todo: find a way to extract this out of the class component
import { TILESIZE } from '../maps/default';

class Npc extends Player {
  constructor({ game, group }) {
    const track = [
      [3, 3],
      [6, 3],
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

  moveTrack(grid) {
    this.move({
      x: this.track[this.index][0],
      y: this.track[this.index][1],
      grid,
      done: () => {
        this.forward =
          (this.forward && !!this.track[this.index + 1]) ||
          (!this.forward && !this.track[this.index - 1]);

        if (this.forward) {
          this.index += 1;
        } else {
          this.index -= 1;
        }

        this.moveTrack(grid);
      },
    });
  }
}

export default Npc;
