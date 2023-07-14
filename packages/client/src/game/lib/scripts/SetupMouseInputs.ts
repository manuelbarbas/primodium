import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import {
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { Scene } from "src/engine/types";
import { offChainComponents, singletonIndex } from "src/network/world";
import { Action } from "src/util/constants";
import { getBuildingAtCoord } from "src/util/tile";
import { inTutorial, validTutorialClick } from "src/util/tutorial";
import { buildPath, demolishBuilding, demolishPath } from "src/util/web3";
import { Network } from "../../../network/layer";
import * as components from "../../api/components";

const setupMouseInputs = (scene: Scene, network: Network, address: string) => {
  const { SelectedAction, SelectedBuilding, SelectedTile } = offChainComponents;
  scene.input.click$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const gameCoord = { x, y: -y };

    //block invalid clicks in tutorial
    if (inTutorial(address, network)) {
      if (!validTutorialClick(gameCoord, network)) return;
    }

    const selectedAction = getComponentValue(
      SelectedAction,
      singletonIndex
    )?.value;

    // update selected action
    const removeSelectedAction = () =>
      removeComponent(SelectedAction, singletonIndex);

    //handle web3 mutations
    switch (selectedAction) {
      case undefined:
        break;
      case Action.DemolishBuilding:
        demolishBuilding(gameCoord, network);
        return;
      case Action.DemolishPath:
        demolishPath(gameCoord, network);
        return;
      case Action.Conveyor:
        const startCoord = components.startSelectedPath(network).get();

        if (!startCoord) {
          components.startSelectedPath(network).set(gameCoord);
          return;
        }

        buildPath(startCoord, gameCoord, network);
        return;
      case Action.SelectAttack:
        return;
    }
    if (selectedAction) removeSelectedAction();

    // update selected building
    const building = getBuildingAtCoord(gameCoord, network);
    if (!building) {
      removeComponent(SelectedBuilding, singletonIndex);
      setComponent(SelectedTile, singletonIndex, gameCoord);
    } else {
      setComponent(SelectedBuilding, singletonIndex, { value: building });
      removeComponent(SelectedTile, singletonIndex);
    }
    components.selectedTile(network).set(gameCoord);
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
