class Test extends Phaser.State {
  private cursors;
  private isoGroup;
  private player;

  constructor() {
    super();
  }

  preload() {
    this.game.load.image('cube', 'assets/images/cube.png');

    // Add and enable the plug-in.
    this.game.plugins.add(Phaser.Plugin.Isometric);
    this.game.time.advancedTiming = true; // for physics, i'm still not sure what is the use yet

    // Start the IsoArcade physics system.
    this.game.physics.startSystem(Phaser.Plugin.Isometric.ISOARCADE);

    // This is used to set a game canvas-based offset for the 0, 0, 0 isometric coordinate - by default
    // this point would be at screen coordinates 0, 0 (top left) which is usually undesirable.
    this.game.iso.anchor.setTo(0.5, 0.2);
  }

  create() {
    // Create a group for our tiles, so we can use Group.sort
    this.isoGroup = this.game.add.group();

    // Set the global gravity for IsoArcade.
    ( this.game.physics as any ).isoArcade.gravity.setTo(0, 0, -500);

    // Let's make a load of cubes on a grid, but do it back-to-front so they get added out of order.
    var cube;
    for (var xx = 256; xx > 0; xx -= 80) {
      for (var yy = 256; yy > 0; yy -= 80) {
        // Create a cube using the new game.add.isoSprite factory method at the specified position.
        // The last parameter is the group you want to add it to (just like game.add.sprite)
        cube = this.game.add.isoSprite(xx, yy, 0, 'cube', 0, this.isoGroup);
        cube.anchor.set(0.5);

        // Enable the physics body on this cube.
        ( this.game.physics as any ).isoArcade.enable(cube);

        // Collide with the world bounds so it doesn't go falling forever or fly off the screen!
        cube.body.collideWorldBounds = true;

        // Add a full bounce on the x and y axes, and a bit on the z axis.
        cube.body.bounce.set(1, 1, 0.2);

        // Add some X and Y drag to make cubes slow down after being pushed.
        cube.body.drag.set(100, 100, 0);
      }
    }

    // Create another cube as our 'player', and set it up just like the cubes above.
    this.player = this.game.add.isoSprite(128, 128, 0, 'cube', 0, this.isoGroup);
    this.player.tint = 0x86bfda;
    this.player.anchor.set(0.5);
    ( this.game.physics as any ).isoArcade.enable(this.player);
    this.player.body.collideWorldBounds = true;

    // Set up our controls.
    this.cursors = this.game.input.keyboard.createCursorKeys();

    this.game.input.keyboard.addKeyCapture([
      Phaser.Keyboard.LEFT,
      Phaser.Keyboard.RIGHT,
      Phaser.Keyboard.UP,
      Phaser.Keyboard.DOWN,
      Phaser.Keyboard.SPACEBAR
    ]);

    var space = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    space.onDown.add(function () {
      this.player.body.velocity.z = 300;
    }, this);
  }

  update() {
    // Move the player at this speed.
    var speed = 100;

    if (this.cursors.up.isDown) {
      this.player.body.velocity.y = -speed;
    } else if (this.cursors.down.isDown) {
      this.player.body.velocity.y = speed;
    } else {
      this.player.body.velocity.y = 0;
    }

    if (this.cursors.left.isDown) {
      this.player.body.velocity.x = -speed;
    } else if (this.cursors.right.isDown) {
      this.player.body.velocity.x = speed;
    } else {
      this.player.body.velocity.x = 0;
    }

    // Our collision and sorting code again.
    ( this.game.physics as any ).isoArcade.collide(this.isoGroup);
    this.game.iso.topologicalSort(this.isoGroup);
  }

  render() {
    this.game.debug.text("Move with cursors, jump with space!", 2, 36, "#ffffff");
    this.game.debug.text(this.game.time.fps.toString() || '--', 2, 14, "#a7aebe");
  }
}

export default Test;