import Phaser from "phaser";
import OutlinePostFx from "phaser3-rex-plugins/plugins/outlinepipeline.js";

export const createPhaserScene = (options: {
  key: string;
  preload?: (scene: Phaser.Scene) => void;
  create?: (scene: Phaser.Scene) => void;
  update?: (scene: Phaser.Scene) => void;
}) => {
  const { preload, create, update, key } = options;
  return class GameScene extends Phaser.Scene {
    constructor() {
      super({ key });
    }

    preload() {
      preload && preload(this);
    }

    create() {
      create && create(this);

      const renderer = this.renderer as Phaser.Renderer.WebGL.WebGLRenderer;

      if (renderer?.pipelines) {
        renderer.pipelines.addPostPipeline("outline", OutlinePostFx);
      }
    }

    update() {
      update && update(this);
    }
  };
};

export default createPhaserScene;
