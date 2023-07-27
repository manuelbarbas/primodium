// import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import { initializeContext } from "../../api";
import { createSceneManager } from "./createSceneManager";
import { deferred } from "@latticexyz/utils";
import { resizePhaserGame } from "../util/resizePhaserGame";
import { GameConfig } from "../../types";
import createPhaserScene from "../util/createPhaserScene";
import { getSceneLoadPromise } from "../util/getSceneLoadPromise";

export const createGame = async (config: GameConfig) => {
  try {
    //Initialize Phaser Game
    const phaserGame = new Phaser.Game(config);

    // Wait for phaser to boot
    const [resolve, , promise] = deferred();
    phaserGame.events.on("ready", resolve);
    await promise;

    const resizer = resizePhaserGame(phaserGame);

    // Create scene for loading assets
    const phaserScene = createPhaserScene({
      key: "ROOT",
      preload: (scene: Phaser.Scene) => {
        scene.load.pack("ROOT", config.assetPackUrl);
      },
    });

    let loadScene = new phaserScene();

    phaserGame.scene.add("ROOT", loadScene, true);

    await getSceneLoadPromise(loadScene);

    /* -------------------------- Create Scene Manager -------------------------- */

    const sceneManager = createSceneManager();

    /* -------------------------------------------------------------------------- */
    const context = {
      phaserGame,
      sceneManager,
      dispose: () => {
        resizer.dispose();
        phaserGame.destroy(true);
        sceneManager.dispose();
      },
    };

    initializeContext(context);

    return context;
  } catch (e) {
    throw e;
  }
};
