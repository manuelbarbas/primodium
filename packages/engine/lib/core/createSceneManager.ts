import { createScene } from "./createScene";
import { deferred } from "@latticexyz/utils";

export type Scene = Awaited<ReturnType<typeof createScene>>;

export const createSceneManager = (phaserGame: Phaser.Game) => {
  const scenes = new Map<string, Scene>();

  const addScene = async (
    config: Parameters<typeof createScene>[1],
    autoStart: boolean = true
  ) => {
    const scene = await createScene(phaserGame, config, autoStart);
    scenes.set(config.key, scene);

    return scene;
  };

  const removeScene = (key: string) => {
    if (!phaserGame) throw new Error("Phaser game not initialized");

    scenes.delete(key);
    phaserGame.scene.remove(key);
    scenes.get(key)?.dispose();
  };

  const transitionToScene = async (
    key: string,
    target: string,
    duration = 1000,
    onTransitionStart = () => {},
    onTransitionComplete = () => {},
    sleep = true
  ) => {
    const [resolve, , promise] = deferred();
    const originScene = scenes.get(key);
    const targetScene = scenes.get(target);

    if (!originScene) {
      console.warn(`Origin Scene ${key} not found`);
      return;
    }

    if (!targetScene) {
      console.warn(`Target Scene ${target} not found`);
      return;
    }

    onTransitionStart();

    scenes.get(key)?.phaserScene.scene.transition({
      target,
      moveAbove: true,
      sleep,
      duration,
      allowInput: false,
    });

    targetScene.phaserScene.events.once(
      Phaser.Scenes.Events.TRANSITION_COMPLETE,
      resolve
    );

    await promise;

    onTransitionComplete();
  };

  return {
    scenes,
    addScene,
    removeScene,
    transitionToScene,
    dispose: () => {
      for (const [key] of scenes) {
        removeScene(key);
      }
    },
  };
};
