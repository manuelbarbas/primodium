import type OutlinePostFx from "phaser3-rex-plugins/plugins/outlinepipeline.js";

export const createFxApi = () => {
  function outline(
    gameObject: Phaser.GameObjects.GameObject & {
      setPostPipeline: (pipeline: string) => void;
      postPipelines: Phaser.Renderer.WebGL.Pipelines.PostFXPipeline[];
    },
    options: {
      thickness?: number;
      color?: number;
    } = {}
  ) {
    const { thickness = 5, color = 0xffff00 } = options;

    gameObject.setPostPipeline("outline");

    const pipeline = gameObject.postPipelines[
      gameObject.postPipelines.length - 1
    ] as OutlinePostFx;

    pipeline.setThickness(thickness);
    pipeline.setOutlineColor(color);
  }

  return {
    outline,
  };
};
