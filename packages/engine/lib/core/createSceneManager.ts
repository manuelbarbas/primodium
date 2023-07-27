import { useEngineStore } from "../../store/EngineStore";
import { createScene } from "./createScene";
import { deferred } from "@latticexyz/utils";

export type Scene = Awaited<ReturnType<typeof createScene>>;

export const createSceneManager = () => {
  const scenes = new Map<string, Scene>();

  const addScene = async (
    key: string,
    config: Parameters<typeof createScene>[0],
    autoStart: boolean = true
  ) => {
    const scene = await createScene(config, autoStart);
    scenes.set(key, scene);

    return scene;
  };

  const removeScene = (key: string) => {
    const { phaserGame } = useEngineStore.getState().game!;
    if (!phaserGame) throw new Error("Phaser game not initialized");

    scenes.get(key)?.dispose();

    scenes.delete(key);
    phaserGame.scene.remove(key);
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
