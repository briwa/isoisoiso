import Person from './person';

class Npc extends Person {
  private index;
  private forward;
  private track;

  constructor({ game, group, map }) {
    const track = [
      [7, 3],
      [1, 3],
    ];

    const z = 0;
    const sprite = 'people';
    const delimiter = 129;

    super({
      game,
      x: track[1][0] * map.tilesize,
      y: track[1][1] * map.tilesize,
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

      const playerX = Math.ceil(player.currentPos().x);
      const playerY = Math.ceil(player.currentPos().y);

      if (nextPosX === playerX && nextPosY === playerY) {
        if (nextPosX === playerX) {
          nextPosX -= 1;
        } else if (nextPosY === playerY) {
          nextPosY -= 1;
        }
      }

      this.moveTo({
        x: nextPosX,
        y: nextPosY,
        onFinished: () => {
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
