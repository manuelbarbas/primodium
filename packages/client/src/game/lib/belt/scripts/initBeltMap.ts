// ASTEROID MAP ENTRY POINT
import engine from "engine";
import { Network } from "../../../../network/layer";
import gameConfig from "../../../config/belt/gameConfig";
import mainSceneConfig from "../../../config/belt/scenes/mainSceneConfig";
import { AsteroidMap } from "../../../constants";
import { runSystems } from "../systems";
import setupCameraMovement from "./setup/setupCameraMovement";
import setupMouseInputs from "./setup/setupMouseInputs";
import { EntityID } from "@latticexyz/recs";
import { createFxApi } from "src/game/api/fx";

const { outline } = createFxApi();

export const initBeltMap = async (player: EntityID, network: Network) => {
  const { Scenes } = AsteroidMap;
  const { world } = network;

  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(
    Scenes.Main,
    mainSceneConfig,
    true
  );

  scene.camera.phaserCamera.fadeIn(1000);

  scene.phaserScene.add.sprite(0, 0, "asteroid-sprite");

  outline(scene.phaserScene.add.sprite(32, 64, "asteroid-titanium-sprite"));

  scene.phaserScene.add.text(0, 16, "[0, 0]", {
    align: "center",
  });

  setupMouseInputs(scene, network, player);
  setupCameraMovement(scene, player);

  runSystems(scene);

  world.registerDisposer(() => {
    game.dispose();
  });
};
