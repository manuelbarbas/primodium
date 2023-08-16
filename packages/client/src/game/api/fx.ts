// import type OutlinePostFx from "phaser3-rex-plugins/plugins/outlinepipeline.js";

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
    // const { thickness = 5, color = 0xffff00 } = options;
    // gameObject.setPostPipeline("outline");
    // const pipeline = gameObject.postPipelines[
    //   gameObject.postPipelines.length - 1
    // ] as OutlinePostFx | undefined;
    // // We check for undefined pipeline because of how embodied entities check if positions are modified.
    // // It creates a proxy object where non relevant functions on game object are ignored thus causing
    // // intermediary steps to return undefined when its not expected to.
    // // TODO: fix modified position function so that upstream does not need to care about implmentation details.
    // if (!pipeline) return;
    // pipeline.setThickness(thickness);
    // pipeline.setOutlineColor(color);
  }

  return {
    outline,
  };
};
