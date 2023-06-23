export class TestSprite extends Phaser.GameObjects.Sprite {
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame: string | number
  ) {
    super(scene, x, y, texture, frame);

    // Additional initialization or configuration specific to MyObject
    // ...

    // scene.add.existing(this);
  }

  update() {
    // Update logic for MyObject
    // ...
  }
}
