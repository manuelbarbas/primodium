import { EntityID } from "@latticexyz/recs";
import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { Scene } from "engine/types";
import { Action } from "src/util/constants";
import { getBuildingAtCoord } from "src/util/tile";
import {
  buildBuilding,
  buildPath,
  demolishBuilding,
  demolishPath,
} from "src/util/web3";
import {
  HoverTile,
  SelectedAction,
  SelectedBuilding,
  SelectedTile,
  StartSelectedPath,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { Network } from "src/network/layer";
import { IsDebug } from "src/network/components/chainComponents";

export const setupMouseInputs = (
  scene: Scene,
  network: Network,
  player: EntityID
) => {
  const clickSub = scene.input.click$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const gameCoord = { x, y: -y };

    const selectedAction = SelectedAction.get()?.value;

    //handle web3 mutations
    switch (selectedAction) {
      case undefined:
        break;
      case Action.DemolishBuilding:
        demolishBuilding(gameCoord, network);
        break;
      case Action.DemolishPath:
        demolishPath(gameCoord, network);
        break;
      case Action.Conveyor:
        const startCoord = StartSelectedPath.get();

        if (!startCoord) {
          StartSelectedPath.set(gameCoord);
          return;
        }

        buildPath(startCoord, gameCoord, network);
        break;
      case Action.PlaceBuilding:
        const selectedBuilding = SelectedBuilding.get()?.value;
        if (!selectedBuilding) return;
        SelectedBuilding.remove();
        buildBuilding(gameCoord, selectedBuilding, player, network);
    }

    if (selectedAction !== undefined) SelectedAction.remove();

    // update selected building
    const building = getBuildingAtCoord(gameCoord);

    if (!building) {
      SelectedBuilding.remove();
      SelectedTile.set(gameCoord);
    } else {
      if (IsDebug.get()?.value)
        console.log("[DEBUG] Selected Building: " + building);
      SelectedBuilding.set({ value: building });
      SelectedTile.remove();
    }
  });

  const pointerMoveSub = scene.input.pointermove$.pipe().subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.pointer.worldX, y: event.pointer.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const mouseCoord = { x, y: -y } as Coord;

    //set hover tile if it is different
    const currentHoverTile = HoverTile.get();
    if (coordEq(currentHoverTile, mouseCoord)) return;

    HoverTile.set(mouseCoord);
  });

  world.registerDisposer(() => {
    clickSub.unsubscribe();
    pointerMoveSub.unsubscribe();
  }, "game");
};
