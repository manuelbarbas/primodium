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
import createTerrainManager from "./managers/createTerrainManager";

const createGame = async (world: World) => {
  const setupPhaserGame = async () => {
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

    const mainScene = await setupMainScene(phaserGame.scenes.MAIN, gameConfig);

    const input = createInput(mainScene.scene.input);
    return { phaserGame, mainScene, input };
  };

  const context = await setupPhaserGame();

  // const api = createApi(network);

  // // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  // const player = (await network.network.signer
  //   .get()!
  //   .getAddress()) as `0x${string}`;

  // Needed?
  // const gameWorld = namespaceWorld(world, "GAME");

  // await getInitialSyncCompletePromise(network);

  // const gameComponents = createGameComponents(
  //   player,
  //   network,
  //   gameWorld,
  //   input,
  //   mainSceneConfig
  // );

  const terrainManager = await createTerrainManager(context);
  terrainManager.lazyAddTerrain();

  // const stateTilesManager = createActiveStateTilesManager(context);
  // setupPlayerStateTilesSystem(context, stateTilesManager);

  // const troopCountManager = createTroopCountManager(context, stateTilesManager);
  // setupTroopCountSystem(context, troopCountManager);

  // const nextMoveTilesManager = createNextMoveTilesManager(
  //   context,
  //   terrainManager
  // );
  // setupNextMoveTilesSystem(context, nextMoveTilesManager);

  // const moveSequenceManager = createMoveSequenceManager(context);
  // setupInputMoveSystem(context, moveSequenceManager);

  // const arrowManager = createArrowManager(context);
  // setupArrowSystem(moveSequenceManager, arrowManager);

  // setupOtherStatesSystem(context);

  // setupCameraSystem(context);

  // await context.game.api.spawn();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // (window as any).game = context;

  return context;
};

export default createGame;
