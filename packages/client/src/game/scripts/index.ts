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
import { createChunkManager } from "./managers/chunkManager";
import {
  setSelectedTileComponent,
  setHoverTileComponent,
  getSelectedBuildingComponent,
  removeSelectedBuildingComponent,
} from "../api/components";
import { BlockType } from "src/util/constants";
import { buildBuilding, destroyBuilding, destroyPath } from "src/util/web3";
import { EntityID } from "@latticexyz/recs";

export const init = async (address: string | undefined, network: Network) => {
  const game = await engine.createGame(gameConfig);
  const scene = await game.sceneManager.addScene(Scenes.Main, mainSceneConfig);

  const chunkManager = await createChunkManager(scene.tilemap);
  chunkManager.renderInitialChunks();
  chunkManager.startChunkRenderer();

  scene.camera.phaserCamera.fadeIn(1000);

  scene.input.click$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    setSelectedTileComponent({ x, y: -y }, network);

    if (!address) return;

    const selectedBuilding = getSelectedBuildingComponent(network);
    //handle web3 mutations
    switch (selectedBuilding) {
      case undefined:
        break;
      case BlockType.DemolishBuilding:
        removeSelectedBuildingComponent(network);
        destroyBuilding({ x, y: -y }, network);
        break;
      case BlockType.DemolishPath:
        removeSelectedBuildingComponent(network);
        destroyPath({ x, y: -y }, network);
      default:
        removeSelectedBuildingComponent(network);
        buildBuilding(
          { x, y: -y },
          selectedBuilding as EntityID,
          address,
          network
        );
        break;
    }
  });

  scene.input.pointermove$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.pointer.worldX, y: event.pointer.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    setHoverTileComponent({ x, y: -y }, network);
  });

  createSpriteSystem(network, scene);
  createPathSystem(network, scene);
  createSelectedTileSystem(network, scene);
  createHoverTileSystem(network, scene);
};
