// import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import { initializeContext } from "../../api";
import { createSceneManager } from "./createSceneManager";
import { deferred } from "@latticexyz/utils";
import { resizePhaserGame } from "../util/resizePhaserGame";
import { GameConfig } from "../../types";

export const createGame = async (config: GameConfig) => {
  try {
    //Initialize Phaser Game
    const phaserGame = new Phaser.Game(config);

    // Wait for phaser to boot
    const [resolve, , promise] = deferred();
    phaserGame.events.on("ready", resolve);
    await promise;

    const resizer = resizePhaserGame(phaserGame);

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
