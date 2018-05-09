import Human from './human';

class Npc extends Human {
  private index;
  private forward;
  private track;
  private hero;

  private moving;

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

    if (this.track) this.moveTrack();
  }

  moveTrack() {
    setTimeout(() => {
      this.generatePaths({
        x: this.track[this.index][0],
        y: this.track[this.index][1],
        onFinished: function() {
          this.setNextIndex();
          this.moveTrack();
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
