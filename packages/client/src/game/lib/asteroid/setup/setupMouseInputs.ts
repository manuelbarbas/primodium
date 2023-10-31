import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { Scene } from "engine/types";
import { getBuildingAtCoord } from "src/util/tile";

import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components } from "src/network/components";
import { SetupResult } from "src/network/types";
import { world } from "src/network/world";
import { outOfBounds } from "src/util/outOfBounds";

export const setupMouseInputs = (scene: Scene, mud: SetupResult) => {
  const playerEntity = mud.network.playerEntity;

  const clickSub = scene.input.click$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const gameCoord = { x, y: -y };

    if (outOfBounds(gameCoord, playerEntity)) {
      components.SelectedBuilding.remove();
      components.SelectedTile.remove();
      return;
    }

    const selectedAction = components.SelectedAction.get()?.value;

    if (selectedAction !== undefined) return;

    // update selected building
    //TODO - fix converting to entity
    const building = getBuildingAtCoord(
      gameCoord,
      (components.Home.get(playerEntity)?.asteroid as Entity) ?? singletonEntity
    ) as Entity;

    if (!building) {
      components.SelectedBuilding.remove();
      components.SelectedTile.set(gameCoord);
    } else {
      components.SelectedBuilding.set({ value: building });
      components.SelectedTile.remove();
    }
  });

  const pointerMoveSub = scene.input.pointermove$.pipe().subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const mouseCoord = { x, y: -y } as Coord;

    //set hover tile if it is different
    const currentHoverTile = components.HoverTile.get();
    if (coordEq(currentHoverTile, mouseCoord)) return;

    if (outOfBounds(mouseCoord, playerEntity)) {
      components.HoverTile.remove();
      return;
    }

    components.HoverTile.set(mouseCoord);
  });

  world.registerDisposer(() => {
    clickSub.unsubscribe();
    pointerMoveSub.unsubscribe();
  }, "game");
};
