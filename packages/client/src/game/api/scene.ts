import { createGame } from "engine/api";
import { Scene } from "engine/types";
import { SceneKeys } from "../lib/constants/common";

export function createSceneApi(game: Awaited<ReturnType<typeof createGame>>) {
  function getScene(scene: SceneKeys) {
    return game.sceneManager.scenes.get(scene);
  }
  function getConfig(scene: SceneKeys) {
    const config = game.sceneManager.scenes.get(scene)?.config;

    if (!config) throw new Error(`Scene ${scene} does not exist`);

    return config;
  }
  async function transitionToScene(
    origin: SceneKeys,
    target: SceneKeys,
    duration = 0,
    onTransitionStart?: (originScene: Scene, targetScene: Scene) => undefined,
    onTransitionEnd?: (originScene: Scene, targetScene: Scene) => undefined
  ) {
    if (origin === target) return;

    await game.sceneManager.transitionToScene(origin, target, duration, onTransitionStart, onTransitionEnd);
  }

  return {
    getConfig,
    getScene,
    transitionToScene,
  };
}
