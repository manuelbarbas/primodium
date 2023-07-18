import { KeybindActions } from "@game/constants";
import { Coord, coordEq, pixelCoordToTileCoord } from "@latticexyz/phaserx";
import {
  getComponentValue,
  removeComponent,
  setComponent,
} from "@latticexyz/recs";
import { Scene } from "src/engine/types";
import { pan, updateWorldView } from "src/game/api/camera";
import { isDown } from "src/game/api/input";
import { offChainComponents, singletonIndex } from "src/network/world";
import { Action } from "src/util/constants";
import { getBuildingAtCoord } from "src/util/tile";
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
  const { maxZoom, minZoom, wheelSpeed } = scene.config.camera;
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
      case Action.PlaceBuilding:
        const selectedBuilding = getComponentValue(
          SelectedBuilding,
          singletonIndex
        )?.value;
        if (!selectedBuilding) return;
        components.selectedBuilding(network).remove();
        buildBuilding(gameCoord, selectedBuilding, address, network);
    }
    if (selectedAction) removeComponent(SelectedAction, singletonIndex);

    // update selected building
    const building = getBuildingAtCoord(gameCoord, network);
    if (!building) {
      removeComponent(SelectedBuilding, singletonIndex);
      setComponent(SelectedTile, singletonIndex, gameCoord);
    } else {
      setComponent(SelectedBuilding, singletonIndex, { value: building });
      removeComponent(SelectedTile, singletonIndex);
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
    const currentHoverTile = components.hoverTile(network).get();
    if (coordEq(currentHoverTile, mouseCoord)) return;

    components.hoverTile(network).set(mouseCoord);
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
  return [pointerMoveSub, doubleClickSub];
};

export default setupMouseInputs;
