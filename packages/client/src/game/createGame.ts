import {
  createInput,
  createPhaserGame,
  createPhaserScene,
  resizePhaserGame,
} from "@smallbraingames/small-phaser";
import { Coord } from "@latticexyz/phaserx";
import type { World } from "@latticexyz/recs";

import { Scenes } from "./constants";
import setupMainScene from "./setup/scene/setupMainScene";
import gameConfig from "./config";
import createKeybindManager from "./managers/createKeybindManager";
import api from "../api";
import createChunkManager from "./managers/createChunkManager";

const createGame = async (world: World, spawnCoord: Coord = { x: 0, y: 0 }) => {
  /* --------------------------- SETUP PHASER GAME -------------------------- */
  const MainScene = createPhaserScene({
    key: Scenes.Main,
    preload: (scene: Phaser.Scene) => {
      scene.load.pack("/assets/pack");
    },
  });

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    fps: {
      target: 60,
      min: 30,
      limit: 60,
    },
    backgroundColor: "dddfd6",
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    scale: {
      mode: Phaser.Scale.NONE,
    },
    autoFocus: true,
    autoCenter: Phaser.Scale.Center.CENTER_BOTH,
    scene: [MainScene],
    pixelArt: true,
  };

  const phaserGame = await createPhaserGame(config);
  resizePhaserGame(phaserGame.game);

  /* ---------------------------- Setup Main Scene ---------------------------- */
  const mainScene = await setupMainScene(
    phaserGame.scenes.Main,
    spawnCoord,
    gameConfig
  );
  /* ------------------------------- Setup Input ------------------------------ */
  const input = createInput(mainScene.scene.input);
  /* -------------------------------------------------------------------------- */
  const context = { phaserGame, mainScene, input, world };

  api.initialize(context);
  /* --------------------------- Initialize Managers -------------------------- */

  const keybindManager = createKeybindManager(context);
  keybindManager.registerKeybinds();

  const chunkManager = createChunkManager();
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  /* -------------------------------------------------------------------------- */

  return context;
};

export default createGame;
