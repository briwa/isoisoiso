/* eslint-disable import/prefer-default-export */
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

    return false;
  };

  return paths.slice(1).reduce((newPath, next) => {
    // always take the last position as the reference
    // if there's none, use the first position as the current one
    const current = newPath[newPath.length - 1] || { position: initialPos };

    // assign direction for the next one
    const nextPosition = {
      x: next[0],
      y: next[1],
    };

    const { direction, speed } = getDirection(current.position, nextPosition);
    newPath.push({
      position: nextPosition,
      speed,
      direction,
    });

    return newPath;
  }, []);
}
