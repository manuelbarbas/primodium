import { Scenes } from "@game/constants";
import { createGame } from "engine/api";
import { Scene } from "engine/types";

export function createSceneApi(game: Awaited<ReturnType<typeof createGame>>) {
  function getConfig(scene: Scenes) {
    return game.sceneManager.scenes.get(scene)?.config;
  }

  async function transitionToScene(
    origin: Scenes,
    target: Scenes,
    duration = 0,
    onTransitionStart?: (originScene: Scene, targetScene: Scene) => undefined,
    onTransitionEnd?: (originScene: Scene, targetScene: Scene) => undefined
  ) {
    await game.sceneManager.transitionToScene(origin, target, duration, onTransitionStart, onTransitionEnd);
  }

  return {
    getConfig,
    transitionToScene,
  };
}
