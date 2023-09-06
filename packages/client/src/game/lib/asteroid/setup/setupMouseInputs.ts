import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { EntityID } from "@latticexyz/recs";
import { Scene } from "engine/types";
import {
  HoverTile,
  SelectedAction,
  SelectedBuilding,
  SelectedTile,
} from "src/network/components/clientComponents";
import { Network } from "src/network/setupNetworkOld";
import { world } from "src/network/world";
import { getBuildingOrigin } from "src/util/building";
import { Action } from "src/util/constants";
import { outOfBounds } from "src/util/outOfBounds";
import { getBuildingAtCoord } from "src/util/tile";
import { buildBuilding, demolishBuilding } from "src/util/web3";

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

    if (outOfBounds(gameCoord, player)) {
      SelectedBuilding.remove();
      SelectedTile.remove();
      return;
    }

    const selectedAction = SelectedAction.get()?.value;

    //handle web3 mutations
    switch (selectedAction) {
      case undefined:
        break;
      case Action.DemolishBuilding:
        demolishBuilding(gameCoord, network);
        break;
      case Action.PlaceBuilding:
        const selectedBuilding = SelectedBuilding.get()?.value;
        if (!selectedBuilding) return;
        SelectedBuilding.remove();
        const buildingOrigin = getBuildingOrigin(gameCoord, selectedBuilding);
        if (!buildingOrigin) return;
        buildBuilding(buildingOrigin, selectedBuilding, player, network);
    }

    if (selectedAction !== undefined) SelectedAction.remove();

    // update selected building
    const building = getBuildingAtCoord(gameCoord);

    if (!building) {
      SelectedBuilding.remove();
      SelectedTile.set(gameCoord);
    } else {
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

    if (outOfBounds(mouseCoord, player)) {
      HoverTile.remove();
      return;
    }

    HoverTile.set(mouseCoord);
  });

  world.registerDisposer(() => {
    clickSub.unsubscribe();
    pointerMoveSub.unsubscribe();
  }, "game");
};
