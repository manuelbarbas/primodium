import { useEngineStore } from "../../store/EngineStore";
import { createScene } from "./createScene";

export const createSceneManager = () => {
  const scenes: Partial<
    Record<string, Awaited<ReturnType<typeof createScene>>>
  > = {};

  const addScene = async (
    key: string,
    config: Parameters<typeof createScene>[0],
    autoStart: boolean = true
  ) => {
    const scene = await createScene(config, autoStart);
    scenes[key] = scene;

    return scene;
  };

  const removeScene = (key: string) => {
    const { phaserGame } = useEngineStore.getState().game!;
    if (!phaserGame) throw new Error("Phaser game not initialized");

    delete scenes[key];
    phaserGame.scene.remove(key);
  };

  return {
    scenes,
    addScene,
    removeScene,
  };
};
