import { Core } from "@primodiumxyz/core";
import { Coord } from "@primodiumxyz/engine/types";
import { defaultEntity } from "@primodiumxyz/reactive-tables";

import { PrimodiumScene } from "@/types";

export const setupMouseInputs = (scene: PrimodiumScene, core: Core) => {
  const {
    tables,
    network: { world },
    utils,
  } = core;

  const clickSub = scene.input.click$.subscribe(([pointer]) => {
    const activeRock = tables.ActiveRock.get()?.value;

    if (tables.Account.get()?.value !== tables.OwnedBy.get(activeRock)?.value) return;

    const { x, y } = scene.utils.pixelCoordToTileCoord({ x: pointer.worldX, y: pointer.worldY });

    const gameCoord = { x, y: -y };

    if (!activeRock || utils.outOfBounds(gameCoord, activeRock)) {
      tables.SelectedBuilding.remove();
      tables.SelectedTile.remove();
      tables.SelectedAction.remove();
      return;
    }

    const selectedAction = tables.SelectedAction.get()?.value;

    if (selectedAction !== undefined) return;

    const building = utils.getBuildingAtCoord(gameCoord, activeRock ?? defaultEntity);

    if (!building) {
      tables.SelectedBuilding.remove();
      tables.SelectedTile.set(gameCoord);
    } else {
      tables.SelectedBuilding.set({ value: building });
      tables.SelectedTile.remove();
    }
  });

  const pointerMoveSub = scene.input.pointermove$.pipe().subscribe((event) => {
    const { x, y } = scene.utils.pixelCoordToTileCoord({ x: event.worldX, y: event.worldY });

    const mouseCoord = { x, y: -y } as Coord;

    //set hover tile if it is different
    const currentHoverTile = tables.HoverTile.get();
    if (scene.utils.coordEq(currentHoverTile, mouseCoord)) return;

    const selectedRock = tables.ActiveRock.get()?.value;
    if (!selectedRock || utils.outOfBounds(mouseCoord, selectedRock)) {
      tables.HoverTile.remove();
      return;
    }

    tables.HoverTile.set(mouseCoord);
  });

  world.registerDisposer(() => {
    clickSub.unsubscribe();
    pointerMoveSub.unsubscribe();
  }, "game");
};
