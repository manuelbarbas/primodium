// PRIMODIUM ENTRY POINT
import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { EntityID } from "@latticexyz/recs";
import { engine } from "../../engine";
import { Network } from "../../network/layer";
import gameConfig from "../config/gameConfig";
import mainSceneConfig from "../config/mainSceneConfig";
import { Scenes } from "../constants";
import { createSpriteSystem } from "../gameComponents/system/spriteSystem";
import { createPathSystem } from "../gameComponents/system/pathSystem";
import { createSelectedTileSystem } from "../gameComponents/system/selectedTileSystem";
import { createHoverTileSystem } from "../gameComponents/system/hoverTileSystem";
import { createChunkManager } from "./managers/chunkManager";
import * as components from "../api/components";
import { BlockType } from "src/util/constants";
import {
  buildBuilding,
  demolishBuilding,
  demolishPath,
  buildPath,
} from "src/util/web3";
import { createSelectedBuildingSystem } from "../gameComponents/system/selectedBuildingSystem";

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

    const mouseCoord = { x, y: -y } as Coord;

    if (!address) return;

    const selectedBuilding = components.selectedBuilding(network).get();
    //handle web3 mutations
    switch (selectedBuilding) {
      case undefined:
        break;
      case BlockType.DemolishBuilding:
        components.selectedBuilding(network).remove();
        demolishBuilding(mouseCoord, network);
        return;
      case BlockType.DemolishPath:
        components.selectedBuilding(network).remove();
        console.log(mouseCoord);
        demolishPath(mouseCoord, network);
      case BlockType.Conveyor:
        const startCoord = components.startSelectedPath(network).get();

        if (!startCoord) {
          components.startSelectedPath(network).set(mouseCoord);
          return;
        }

        components.selectedBuilding(network).remove();
        buildPath(startCoord, mouseCoord, network);
        return;
      default:
        components.selectedBuilding(network).remove();
        buildBuilding(
          mouseCoord,
          selectedBuilding as EntityID,
          address,
          network
        );
        return;
    }

    components.selectedTile(network).set(mouseCoord);
  });

  scene.input.pointermove$.pipe().subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.pointer.worldX, y: event.pointer.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const mouseCoord = { x, y: -y } as Coord;

    //set hover tile if it is different
    const currentHoverTile = components.hoverTile(network).get();

    if (coordEq(currentHoverTile, mouseCoord)) return;

    components.hoverTile(network).set(mouseCoord);
  });

  //init systems
  createSpriteSystem(network, scene);
  createPathSystem(network, scene);
  createSelectedTileSystem(network, scene);
  createHoverTileSystem(network, scene);
  createSelectedBuildingSystem(network);
};
