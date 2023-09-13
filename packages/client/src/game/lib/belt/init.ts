// STAR MAP ENTRY POINT
import { SingletonID } from "@latticexyz/network";
import { EntityID } from "@latticexyz/recs";
import engine from "engine";
import { Account } from "src/network/components/clientComponents";
import { Network } from "../../../network/setupNetworkOld";
import gameConfig from "../../config/belt/game";
import mainSceneConfig from "../../config/belt/mainScene";
import { BeltMap } from "../../constants";
import { setupBasicCameraMovement } from "../common/setup/setupBasicCameraMovement";
import { runSystems } from "./systems";

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

  const player = Account.get()?.value ?? SingletonID;
  runSystems(scene, player);

  world.registerDisposer(() => {
    game.dispose();
  }, "game");
};
