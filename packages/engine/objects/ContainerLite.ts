import Phaser from "phaser";
import _ContainerLite from "phaser3-rex-plugins/plugins/containerlite.js";

export class ContainerLite extends _ContainerLite {
  scene: Phaser.Scene;
  constructor(...args: ConstructorParameters<typeof _ContainerLite>) {
    super(...args);
    this.scene = args[0];
  }

  addChildrenToScene() {
    this.getChildren().forEach((child) => {
      if (child instanceof ContainerLite) child.addChildrenToScene();
      else this.scene.add.existing(child);
    });
  }
}
