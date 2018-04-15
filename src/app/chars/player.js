import Person from './person';

class Player extends Person {
  constructor({ x, y, game, group, map }) {
    const z = 0;
    const sprite = 'people';
    const delimiter = 0;

    super({
      game,
      x,
      y,
      z,
      sprite,
      delimiter,
      group,
      map,
    });
  }
}

export default Player;
