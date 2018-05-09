import Human from './human';

export function shapePaths(paths) {
  const initialPos = {
    x: paths[0][0],
    y: paths[0][1],
  };

  const getDirection = (prev, next) => {
    if (prev.x === next.x) {
      return {
        direction: prev.y > next.y ? 'up' : 'down',
        speed: Math.abs(next.y - prev.y),
      };
    }

    if (prev.y === next.y) {
      return {
        direction: prev.x > next.x ? 'left' : 'right',
        speed: Math.abs(next.x - prev.x),
      };
    }
  };

  return paths.slice(1).reduce((newPath, next) => {
    // always take the last position as the reference
    // if there's none, use the first position as the current one
    const current = newPath[newPath.length - 1] || initialPos;

    // assign direction for the next one
    const newX = next[0];
    const newY = next[1];

    const { direction, speed } = getDirection(current, { x: newX, y: newY });
    newPath.push({
      x: newX,
      y: newY,
      speed,
      direction,
    });

    return newPath;
  }, []);
}

export function onColliding(sprites) {
  sprites.forEach((sprite) => {
    // when humans collide
    if (sprite.char instanceof Human) {
      // stop them from moving
      sprite.char.paths = [];
      sprite.char.onStopMoving();
    }
  });
}
