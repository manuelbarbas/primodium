import {
  createInput,
  createPhaserGame,
  resizePhaserGame,
} from "@smallbraingames/small-phaser";
import type { World } from "@latticexyz/recs";
// import DragPlugin from "phaser3-rex-plugins/plugins/drag-plugin";

import { GameStatus, Scenes } from "./constants";
import setupMainScene from "./setup/scene/setupMainScene";
import gameConfig from "./config";
import api from "../api";
import createChunkManager from "./managers/createChunkManager";
import { useGameStore } from "../store/GameStore";

const createGame = async (world: World) => {
  try {
    const setGameStatus = useGameStore.getState().setStatus;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.WEBGL,
      parent: "phaser-container",
      fps: {
        target: 120,
        min: 30,
        limit: 120,
      },
      backgroundColor: "64748b",
      width: window.innerWidth * window.devicePixelRatio,
      height: window.innerHeight * window.devicePixelRatio,
      scale: {
        mode: Phaser.Scale.NONE,
      },
      autoFocus: true,
      autoCenter: Phaser.Scale.Center.CENTER_BOTH,
      pixelArt: true,
    };

    //Initialize Phaser Game
    setGameStatus(GameStatus.Loading);
    const phaserGame = await createPhaserGame(config);
    resizePhaserGame(phaserGame.game);

    /* ------------------------------- Setup Scenes ----------------------------- */

    const mainScene = await setupMainScene(phaserGame, gameConfig);

    /* ------------------------------- Setup Input ------------------------------ */
    const input = createInput(mainScene.scene.input);
    /* -------------------------------------------------------------------------- */
    const context = {
      phaserGame,
      scenes: {
        [Scenes.Main]: mainScene,
      },
      input,
      world,
    };

    api.initializeContext(context);

    /* --------------------------- Initialize Managers -------------------------- */

    const chunkManager = createChunkManager();
    chunkManager.startChunkRenderer();
    chunkManager.renderInitialChunks();

    /* -------------------------------------------------------------------------- */

    setGameStatus(GameStatus.Ready);

    return context;
  } catch (e) {
    console.error(e);
    return null;
  }
};

export default createGame;
