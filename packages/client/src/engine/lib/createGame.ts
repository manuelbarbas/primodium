// import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";
import api from "../api";
import createSceneManager from "./createSceneManager";
import { deferred } from "@latticexyz/utils";
import { resizePhaserGame } from "./resizePhaserGame";

const createGame = async (config: Phaser.Types.Core.GameConfig) => {
  try {
    //Initialize Phaser Game
    const phaserGame = new Phaser.Game(config);

    // Wait for phaser to boot
    const [resolve, , promise] = deferred();
    phaserGame.events.on("ready", resolve);
    await promise;

    resizePhaserGame(phaserGame);

    /* -------------------------- Create Scene Manager -------------------------- */

    const sceneManager = createSceneManager();

    /* -------------------------------------------------------------------------- */
    const context = {
      phaserGame,
      sceneManager,
    };

    api.initializeContext(context);

    return context;
  } catch (e) {
    throw e;
  }
};

export default createGame;
