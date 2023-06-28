// PRIMODIUM ENTRY POINT
import { pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { setComponent } from "@latticexyz/recs";
import { SingletonID } from "@latticexyz/network";

import { engine } from "../../engine";
import { Network } from "../../network/layer";
import gameConfig from "../config/gameConfig";
import mainSceneConfig from "../config/mainSceneConfig";
import { Scenes } from "../constants";
import { createSpriteSystem } from "../gameComponents/system/buildingSystem";
import { createPathSystem } from "../gameComponents/system/pathSystem";
import { createSelectedTileSystem } from "../gameComponents/system/selectedTileSystem";
import { createHoverTileSystem } from "../gameComponents/system/hoverTileSystem";
import { createChunkManager } from "./managers/chunkManager";
import {
  setSelectedTileComponent,
  setHoverTileComponent,
} from "../api/components";

export const init = async (network: Network) => {
  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(Scenes.Main, mainSceneConfig);

  const chunkManager = await createChunkManager(scene.tilemap);
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  scene.input.click$.subscribe((event) => {
    const coord = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    setSelectedTileComponent(coord, network);
  });

  scene.input.pointermove$.subscribe((event) => {
    const coord = pixelCoordToTileCoord(
      { x: event.pointer.worldX, y: event.pointer.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    setHoverTileComponent(coord, network);
  });

  createSpriteSystem(network, scene);
  createPathSystem(network, scene);
  createSelectedTileSystem(network, scene);
  createHoverTileSystem(network, scene);
};
