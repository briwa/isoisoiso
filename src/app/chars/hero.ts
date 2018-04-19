import Human from './human';

class Hero extends Human {
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

export default Hero;
