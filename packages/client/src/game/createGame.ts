import {
  createInput,
  createPhaserGame,
  createPhaserScene,
  resizePhaserGame,
} from "@smallbraingames/small-phaser";
import type { World } from "@latticexyz/recs";

import { Scenes } from "../util/types";
import setupMainScene from "./setup/scene/setupMainScene";
import gameConfig from "./config";

const createGame = async (world: World) => {
  /* --------------------------- SETUP PHASER GAME -------------------------- */
  const MainScene = createPhaserScene({
    key: Scenes.MAIN,
    preload: (scene: Phaser.Scene) => {
      scene.load.pack("/assets/pack");
    },
  });

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "phaser-container",
    backgroundColor: "dddfd6",
    width: window.innerWidth * window.devicePixelRatio,
    height: window.innerHeight * window.devicePixelRatio,
    scale: {
      mode: Phaser.Scale.NONE,
    },
    scene: [MainScene],
    pixelArt: true,
  };

  const phaserGame = await createPhaserGame(config);
  resizePhaserGame(phaserGame.game);

  /* ---------------------------- Setup Main Scene ---------------------------- */
  const mainScene = await setupMainScene(phaserGame.scenes.MAIN, gameConfig);
  /* ------------------------------- Setup Input ------------------------------ */
  const input = createInput(mainScene.scene.input);
  /* -------------------------------------------------------------------------- */
  const context = { phaserGame, mainScene, input, world };
  /* --------------------------- Initialize Managers -------------------------- */

  /* -------------------------------------------------------------------------- */

  return context;
};

export default createGame;
