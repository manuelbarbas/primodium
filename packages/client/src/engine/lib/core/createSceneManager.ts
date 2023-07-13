import { useEngineStore } from "../../store/EngineStore";
import { createScene } from "./createScene";

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

  return {
    scenes,
    addScene,
    removeScene,
    dispose: () => {
      for (const [key] of scenes) {
        removeScene(key);
      }
    },
  };
};
