import { getBuildingAtCoord } from "@primodiumxyz/core/util/tile";
import { Entity } from "@latticexyz/recs";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { Coord } from "@primodiumxyz/engine/types";
import { components } from "@primodiumxyz/core/network/components";
import { world } from "@primodiumxyz/core/network/world";
import { outOfBounds } from "@primodiumxyz/core/util/outOfBounds";

import { PrimodiumScene } from "@/api/scene";

export const setupMouseInputs = (scene: PrimodiumScene) => {
  const clickSub = scene.input.click$.subscribe(([pointer]) => {
    const activeRock = components.ActiveRock.get()?.value;

    if (components.Account.get()?.value !== components.OwnedBy.get(activeRock)?.value) return;

    const { x, y } = scene.utils.pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY });

    const gameCoord = { x, y: -y };

    if (!activeRock || outOfBounds(gameCoord, activeRock)) {
      components.SelectedBuilding.remove();
      components.SelectedTile.remove();
      components.SelectedAction.remove();
      return;
    }

    const selectedAction = components.SelectedAction.get()?.value;

    if (selectedAction !== undefined) return;

    const building = getBuildingAtCoord(gameCoord, (activeRock as Entity) ?? singletonEntity) as Entity;

    if (!building) {
      components.SelectedBuilding.remove();
      components.SelectedTile.set(gameCoord);
    } else {
      components.SelectedBuilding.set({ value: building });
      components.SelectedTile.remove();
    }
  });

  const pointerMoveSub = scene.input.pointermove$.pipe().subscribe((event) => {
    const { x, y } = scene.utils.pixelCoordToTileCoord({ x: event.worldX, y: event.worldY });

    const mouseCoord = { x, y: -y } as Coord;

    //set hover tile if it is different
    const currentHoverTile = components.HoverTile.get();
    if (scene.utils.coordEq(currentHoverTile, mouseCoord)) return;

    const selectedRock = components.ActiveRock.get()?.value;
    if (!selectedRock || outOfBounds(mouseCoord, selectedRock)) {
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
