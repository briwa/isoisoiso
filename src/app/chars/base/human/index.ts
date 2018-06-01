import { shapePaths } from 'src/app/chars/helper';
import MapPlain from 'src/app/maps/plain';
import SpriteHuman, { Config, Direction, MovementKeys } from 'src/app/sprites/human';

export interface Path {
  x: number;
  y: number;
  direction: Direction;
};

interface Signals {
  [action:string]: {
    [id:string]: Phaser.Signal;
  }
};

class Human extends SpriteHuman {
  private map: MapPlain;
  private views: string[] = ['map'];
  private signals: Signals = {};

  public name: string; // max speed, don't go higher than this
  public speed: number = 100; // max speed, don't go higher than this
  public paths: Path[] = [];
  public busy: boolean = false;

  constructor(config: Config) {
    super(config);

    // setup map
    this.map = config.map;

    // events
    this.createListener('pathsStart');
    this.createListener('pathsFinished');
    this.createListener('pathEnd');

    // actions
    this.createListener('up');
    this.createListener('down');
    this.createListener('action');
    this.createListener('cancel');
  }

  // TODO: rename this to currentView?
  get view() {
    return this.views[0];
  }

  get inMap() {
    return this.views[0] === 'map';
  }

  set view(overlay) {
    if (overlay) {
      // put them at the first of the array for easy access
      this.views.unshift(overlay);
    } else {
      // remove the currently viewed (first of the array)
      this.views.splice(0, 1);
    }
  }

  registerMovement() {
    switch (this.movement.type) {
      case 'mouse':
      case 'track':
      case 'follow':
        this.movePaths();
        break;
      case 'keys':
        this.moveKeys();
        break;
      default:
        throw new Error('Invalid movement type!');
    }
  }

  generatePaths({ x, y, onFinished }: {x: number, y: number, onFinished?: Function }): Path[] {
    // in normal case, we use the current position as the start of position
    // to be used for pathfinding
    const startPos = {
      x: this.position(true).x,
      y: this.position(true).y,
    };

    const walkablePaths = this.map.findPath(startPos.x, startPos.y, x, y);

    // no need to proceed when there's no paths
    const noPath = walkablePaths.length === 0;

    if (noPath) {
      this.stopAnimation();
      return [];
    }

    if (onFinished) {
      this.listenOnce('pathsFinished', onFinished);
    }

    this.dispatch('pathsStart');

    this.paths = shapePaths(walkablePaths);
    return this.paths;
  }

  movePaths() {
    // do not move when it's not in the map
    if (!this.inMap || this.busy) {
      return false;
    }

    // only stop when there's no more paths left
    // we want the animation to run seamlessly
    if (!this.paths.length) {
      this.onStopMoving();
      return;
    }

    const {x, y, direction} = this.paths[0];

    // start moving
    this.goTo(direction, this.speed);

    // once the diff gets smaller than treshold, means we're at the end of the path
    const curr = this.position();
    const treshold = 5 / this.speed;
    const diffX = Math.abs((curr.x - this.anchorX) - x);
    const diffY = Math.abs((curr.y - this.anchorY) - y);

    if (
      diffX >= 0 && diffX <= treshold && (direction === 'left' || direction === 'right') ||
      diffY >= 0 && diffY <= treshold && (direction === 'up' || direction === 'down')
    ) {
      this.dispatch('pathEnd');
      // remove the tween that is already done
      this.paths = this.paths.slice(1);
    }
  }

  moveKeys() {
    // do not move when it's not in the map
    if (!this.inMap || this.busy) {
      return false;
    }

    const movement = <MovementKeys> this.movement;

    let direction = null;
    if (movement.input.w.isDown) {
      direction = 'up';
    } else if (movement.input.s.isDown) {
      direction = 'down';
    } else if (movement.input.a.isDown) {
      direction = 'left';
    } else if (movement.input.d.isDown) {
      direction = 'right';
    }

    this.goTo(direction, this.speed);

    // TODO: needs to be debounced,
    // only emits when the position has changed
    this.dispatch('pathEnd');
  }

  onStopMoving() {
    this.goTo(null);
    this.dispatch('pathsFinished');
  }

  doneView() {
    this.view = null;
  }

  resetView() {
    this.views = ['map'];
  }

  // events
  createListener(name: string, id = 'map') {
    if (!this.signals[name]) {
      this.signals[name] = {};
    }

    this.signals[name][id] = new Phaser.Signal();
  }

  removeListener(name: string, callback: Function, context?: any) {
    const listenerContext = context || this;
    const listenerId = listenerContext.id || 'map'; // by default listener is listening when subject is in map

    this.signals[name][listenerId].remove(callback, listenerContext);
  }

  listen(name: string, callback: Function, context?: any, id?: string, once?: boolean) {
    const listenerContext = context || this;
    const listenerId = id || listenerContext.id || 'map';

    if (!this.signals[name]) {
      throw new Error( `Cannot listen to signals thad doesn't exist: ${name}` );
    }

    if (!this.signals[name][listenerId]) {
      this.createListener(name, listenerId);
    }

    const method = once ? 'addOnce' : 'add';
    this.signals[name][listenerId][method](callback, listenerContext);
  }

  // TODO: review listenOnce since it might create junk listeners
  listenOnce(name: string, callback: Function, context?: any, id?: string) {
    this.listen(name, callback, context, id, true);
  }

  dispatch(name: string, params?: any) {
    if (this.signals[name] && this.signals[name][this.view]) {
      this.signals[name][this.view].dispatch(params);
    }
  }
}

export default Human;
