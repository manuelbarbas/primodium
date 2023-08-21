// import type OutlinePostFx from "phaser3-rex-plugins/plugins/outlinepipeline.js";

export const createFxApi = () => {
  function outline(
    gameObject: Phaser.GameObjects.Sprite,
    options: {
      thickness?: number;
      color?: number;
      knockout?: boolean;
    } = {}
  ) {
    const { thickness = 5, color = 0xffff00, knockout } = options;

    if (!(gameObject instanceof Phaser.GameObjects.Sprite)) return;

    gameObject.clearFX();
    gameObject.preFX?.addGlow(color, thickness, undefined, knockout);
  }

  function removeOutline(gameObject: Phaser.GameObjects.Sprite) {
    // gameObject.removePostPipeline("outline");
    gameObject.clearFX();
  }

  return {
    outline,
    removeOutline,
  };
};
