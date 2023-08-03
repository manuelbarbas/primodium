// ASTEROID MAP ENTRY POINT
import engine from "engine";
import { Network } from "../../../network/layer";
import gameConfig from "../../config/belt/game";
import mainSceneConfig from "../../config/belt/mainScene";
import { AsteroidMap } from "../../constants";
// import { runSystems } from "./systems";
import { EntityID } from "@latticexyz/recs";
import { createFxApi } from "src/game/api/fx";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";

export const initBeltView = async (_: EntityID, network: Network) => {
  const { Scenes } = AsteroidMap;
  const { world } = network;
  const { outline } = createFxApi();

  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(
    Scenes.Main,
    mainSceneConfig,
    true
  );

  scene.camera.phaserCamera.fadeIn(1000);

  scene.phaserScene.add.sprite(0, 0, "asteroid-sprite");

  outline(
    scene.phaserScene.add.sprite(10 * 32, -10 * 32, "asteroid-titanium-sprite")
  );

  scene.phaserScene.add.text(0, 16, "[0, 0]", {
    align: "center",
  });

  setupBasicCameraMovement(scene, {
    translateKeybind: false,
  });

  // runSystems(scene);

  world.registerDisposer(() => {
    game.dispose();
  });
};
