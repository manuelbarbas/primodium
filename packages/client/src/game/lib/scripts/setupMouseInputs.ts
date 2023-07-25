import { KeybindActions } from "@game/constants";
import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import { Scene } from "src/engine/types";
import { pan, updateWorldView } from "src/game/api/camera";
import { isDown } from "src/game/api/input";
import { Action } from "src/util/constants";
import { getBuildingAtCoord } from "src/util/tile";
import {
  buildBuilding,
  buildPath,
  demolishBuilding,
  demolishPath,
} from "src/util/web3";
import { Network } from "../../../network/layer";
import {
  HoverTile,
  SelectedAction,
  SelectedBuilding,
  SelectedTile,
  StartSelectedPath,
} from "src/network/components/clientComponents";
import { world } from "src/network/world";
import { EntityID } from "@latticexyz/recs";

const setupMouseInputs = (scene: Scene, network: Network, player: EntityID) => {
  const { maxZoom, minZoom, wheelSpeed } = scene.config.camera;

  scene.input.click$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const gameCoord = { x, y: -y };

    //block invalid clicks in tutorial
    // if (inTutorial(address, network)) {
    //   if (!validTutorialClick(gameCoord, network)) return;
    // }

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
      case Action.SelectAttack:
        return;
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

  scene.input.phaserInput.on(
    "wheel",
    ({ deltaY }: { deltaY: number; event: any }) => {
      let scale = 0.02;

      if (isDown(KeybindActions.Modifier)) scale /= 2;

      if (deltaY < 0) {
        const zoom = Math.min(
          scene.camera.phaserCamera.zoom + wheelSpeed * scale,
          maxZoom
        );
        scene.camera.setZoom(zoom);
      } else if (deltaY > 0) {
        const zoom = Math.max(
          scene.camera.phaserCamera.zoom - wheelSpeed * scale,
          minZoom
        );
        scene.camera.setZoom(zoom);
      }
    }
  );

  const doubleClickSub = scene.input.doubleClick$.subscribe((event) => {
    const { x, y } = pixelCoordToTileCoord(
      { x: event.worldX, y: event.worldY },
      scene.tilemap.tileWidth,
      scene.tilemap.tileHeight
    );

    const gameCoord = { x, y: -y } as Coord;

    //set to default zoomTo and pan to mouse position
    scene.camera.phaserCamera.zoomTo(
      scene.config.camera.defaultZoom,
      1000,
      undefined,
      undefined,
      () => updateWorldView()
    );
    pan(gameCoord);
  });

  world.registerDisposer(() => {
    pointerMoveSub.unsubscribe();
    doubleClickSub.unsubscribe();
  });
};

export default setupMouseInputs;
