import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { EntityID } from "@latticexyz/recs";
import { Scene } from "src/engine/types";
import { BlockType } from "src/util/constants";
import { inTutorial, validTutorialClick } from "src/util/tutorial";
import {
  buildBuilding,
  buildPath,
  demolishBuilding,
  demolishPath,
} from "src/util/web3";
import { Network } from "../../../network/layer";
import * as components from "../../api/components";

const setupMouseInputs = (scene: Scene, network: Network, address: string) => {
  scene.input.click$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const gameCoord = { x, y: -y } as Coord;

    //make sure player address is initialized
    if (!address) return;

    //block invalid clicks in tutorial
    if (inTutorial(address, network)) {
      if (!validTutorialClick(gameCoord, network)) return;
    }

    const selectedBuilding = components.selectedBuilding(network).get();
    components.selectedTile(network).set(gameCoord);

    //handle web3 mutations
    switch (selectedBuilding) {
      case undefined:
        break;
      case BlockType.DemolishBuilding:
        components.selectedBuilding(network).remove();
        demolishBuilding(gameCoord, network);
        return;
      case BlockType.DemolishPath:
        components.selectedBuilding(network).remove();
        demolishPath(gameCoord, network);
        return;
      case BlockType.Conveyor:
        const startCoord = components.startSelectedPath(network).get();

        if (!startCoord) {
          components.startSelectedPath(network).set(gameCoord);
          return;
        }

        components.selectedBuilding(network).remove();
        buildPath(startCoord, gameCoord, network);
        return;
      case BlockType.SelectAttack:
        const selectedAttackTiles = components.selectedAttack(network).get();

        if (!selectedAttackTiles.origin) {
          components.selectedAttack(network).setOrigin(gameCoord);
          return;
        }

        if (!selectedAttackTiles.target) {
          components.selectedAttack(network).setTarget(gameCoord);
          return;
        }
        //if both origin and target are set, don't do anything
        break;
      default:
        components.selectedBuilding(network).remove();
        buildBuilding(
          gameCoord,
          selectedBuilding as EntityID,
          address,
          network
        );
        return;
    }
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
};

export default setupMouseInputs;
