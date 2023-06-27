// PRIMODIUM ENTRY POINT
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { engine } from "../../engine";
import { Network } from "../../network/layer";
import gameConfig from "../config/gameConfig";
import mainSceneConfig from "../config/mainSceneConfig";
import { Scenes } from "../constants";
import { createSpriteSystem } from "../gameComponents/system/buildingSystem";
import { createPathSystem } from "../gameComponents/system/pathSystem";
import { createSelectedTileSystem } from "../gameComponents/system/selectedTileSystem";
import { createHoverTileSystem } from "../gameComponents/system/hoverTileSystem";

import createChunkManager from "./managers/chunkManager";
import { setComponent } from "@latticexyz/recs";
import { SingletonID } from "@latticexyz/network";

export const init = async (network: Network) => {
  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(Scenes.Main, mainSceneConfig);
  const { offChainComponents, world } = network;

  const chunkManager = await createChunkManager(scene.tilemap);
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  const singletonIndex = world.registerEntity({ id: SingletonID });
  scene.input.click$.subscribe((event) => {
    const coord = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    setComponent(offChainComponents.SelectedTile, singletonIndex, {
      x: coord.x,
      y: -coord.y,
    });
  });

  scene.input.pointermove$.subscribe((event) => {
    const coord = pixelCoordToTileCoord(
      { x: event.pointer.worldX, y: event.pointer.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    setComponent(offChainComponents.HoverTile, singletonIndex, {
      x: coord.x,
      y: -coord.y,
    });
  });

  createSpriteSystem(network, scene);
  createPathSystem(network, scene);
  createSelectedTileSystem(network, scene);
  createHoverTileSystem(network, scene);
};
