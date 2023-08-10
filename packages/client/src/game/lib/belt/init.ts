// STAR MAP ENTRY POINT
import engine from "engine";
import { Network } from "../../../network/layer";
import gameConfig from "../../config/belt/game";
import mainSceneConfig from "../../config/belt/mainScene";
import { BeltMap } from "../../constants";
import { runSystems } from "./systems";
import { EntityID } from "@latticexyz/recs";
import { createFxApi } from "src/game/api/fx";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";

export const initBeltView = async (_: EntityID, network: Network) => {
  const { Scenes } = BeltMap;
  const { world } = network;

  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(
    Scenes.Main,
    mainSceneConfig,
    true
  );

  scene.camera.phaserCamera.fadeIn(1000);

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });

  runSystems(scene);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
