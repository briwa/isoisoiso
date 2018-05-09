import Phaser from 'phaser-ce';
import Human from './human';

type Track = [number, number][];

interface Config {
  game: Phaser.Game;
  group: Phaser.Group;
  map: any;
  x?: number;
  y?: number;
  track?: Track;
  follow?: Human;
};

class Npc extends Human {
  private index: number;
  private forward: boolean;

  constructor({ x, y, game, group, map, track, follow }: Config) {
    const z = 0;
    const sprite = 'people';
    const delimiter = 129;

    super({
      game,
      x: (track ? track[1][0] : x) * map.tilesize,
      y: (track ? track[1][1] : y) * map.tilesize,
      z,
      sprite,
      delimiter,
      group,
      map,
    });

    this.index = 0;
    this.forward = true;

    if (follow) {
      const onFollow = () => {
        this.generatePaths({
          x: follow.position(true).x,
          y: follow.position(true).y,
        });

        // also follow the char on every movement
        follow.listen('endPath', () => {
          onFollow();
        });
      };

      onFollow();
    } else if (track) {
      this.moveTrack(track);
    }
  }

  moveTrack(track: Track) {
    setTimeout(() => {
      this.generatePaths({
        x: track[this.index][0],
        y: track[this.index][1],
        onFinished: function() {
          this.setNextIndex();
          this.moveTrack(track);
        },
      });
    }, 2000);
  }

  setNextIndex(track: Config['track']) {
    this.forward =
      (this.forward && !!track[this.index + 1]) ||
      (!this.forward && !track[this.index - 1]);

    if (this.forward) {
      this.index += 1;
    } else {
      this.index -= 1;
    }
  }
}

export default Npc;
