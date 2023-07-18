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

  //accumalate sub-pixel movement during a gametick and add to next game tick.
  let accumulatedX = 0;
  let accumulatedY = 0;
  let targetX = 0;
  let targetY = 0;

  let originDragPoint: Phaser.Math.Vector2 | undefined;

  const SPEED = 750;
  const ZOOM_SPEED = 5;
  const SMOOTHNESS = 0.9;
  const handleCameraMovement = (_: number, delta: number) => {
    const zoom = scene.camera.phaserCamera.zoom;
    const zoomSpeed = isDown(KeybindActions.Modifier)
      ? ZOOM_SPEED / 3
      : ZOOM_SPEED;

    const zoomAmount = zoomSpeed * (delta / 1000);
    if (isDown(KeybindActions.ZoomIn)) {
      const targetZoom = Math.min(zoom + zoomAmount, maxZoom);
      scene.camera.setZoom(targetZoom);
    }

    if (isDown(KeybindActions.ZoomOut)) {
      const targetZoom = Math.max(zoom - zoomAmount, minZoom);
      scene.camera.setZoom(targetZoom);
    }

    if (isDown(KeybindActions.Center)) {
      pan({ x: 0, y: 0 });
    }

    if (isDown(KeybindActions.Base)) {
      const mainBaseCoord = components.mainBase(network).get(address);

      if (mainBaseCoord) pan(mainBaseCoord);
    }

    // HANDLE CAMERA SCROLL MOVEMENT KEYS
    const speed = isDown(KeybindActions.Modifier) ? SPEED / 3 : SPEED;
    const moveDistance = speed * (delta / 1000);
    let scrollX = scene.camera.phaserCamera.scrollX;
    let scrollY = scene.camera.phaserCamera.scrollY;
    let moveX = 0;
    let moveY = 0;
    if (isDown(KeybindActions.Up)) moveY--;
    if (isDown(KeybindActions.Down)) moveY++;
    if (isDown(KeybindActions.Left)) moveX--;
    if (isDown(KeybindActions.Right)) moveX++;

    //only register movement when no tweens are running
    if (
      (moveX !== 0 || moveY !== 0) &&
      !scene.phaserScene.tweens.getTweensOf(scene.camera.phaserCamera).length
    ) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      accumulatedX += (moveX / length) * moveDistance;
      accumulatedY += (moveY / length) * moveDistance;

      const integralMoveX = Math.floor(accumulatedX);
      const integralMoveY = Math.floor(accumulatedY);

      accumulatedX -= integralMoveX;
      accumulatedY -= integralMoveY;

      targetX += integralMoveX;
      targetY += integralMoveY;

      scrollX = Phaser.Math.Linear(scrollX, targetX, 1 - SMOOTHNESS);
      scrollY = Phaser.Math.Linear(scrollY, targetY, 1 - SMOOTHNESS);
      scene.camera.setScroll(scrollX, scrollY);
      return;
    }

    if (isDown(KeybindActions.LeftClick)) {
      if (originDragPoint) {
        const { x, y } = scene.input.phaserInput.activePointer.position;
        const { x: prevX, y: prevY } = originDragPoint;
        // don't move camera if pointer is not moving much
        if (scene.input.phaserInput.activePointer.velocity.length() < 5) return;

        let scrollX = scene.camera.phaserCamera.scrollX;
        let scrollY = scene.camera.phaserCamera.scrollY;

        let dx = Math.round((x - prevX) / zoom);
        let dy = Math.round((y - prevY) / zoom);

        scene.camera.setScroll(scrollX - dx, scrollY - dy);
      }
      originDragPoint = scene.phaserScene.input.activePointer.position.clone();
    } else {
      originDragPoint = undefined;
    }

    targetX = scene.camera.phaserCamera.scrollX;
    targetY = scene.camera.phaserCamera.scrollY;
  };

  scene.scriptManager.add(handleCameraMovement);

  return [pointerMoveSub, doubleClickSub];
};

export default setupMouseInputs;
