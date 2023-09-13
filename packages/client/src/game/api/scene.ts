import { Scene } from "engine/types";

export function createSceneApi(scene: Scene) {
  function getConfig() {
    return scene.config;
  }

  return {
    getConfig,
  };
}
