import {
  createPhaserGame,
  resizePhaserGame,
} from "@smallbraingames/small-phaser";
// import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";

import api from "../api";
import createSceneManager from "./createSceneManager";

const createGame = async (config: Phaser.Types.Core.GameConfig) => {
  try {
    //Initialize Phaser Game
    const phaserGame = await createPhaserGame(config);
    resizePhaserGame(phaserGame.game);

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
