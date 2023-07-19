import { KeybindActions } from "@game/constants";
import { Scene } from "src/engine/types";
import { pan } from "src/game/api/camera";
import { isDown } from "src/game/api/input";
import { Network } from "src/network/layer";
import { world } from "src/network/world";
import { Address } from "wagmi";
import * as components from "../../api/components";
const SPEED = 750;
const ZOOM_SPEED = 5;
const SMOOTHNESS = 0.9;

const setupCameraMovement = (
  scene: Scene,
  network: Network,
  address: Address
) => {
  const { maxZoom, minZoom } = scene.config.camera;

  //accumalate sub-pixel movement during a gametick and add to next game tick.
  let accumulatedX = 0;
  let accumulatedY = 0;
  let targetX = 0;
  let targetY = 0;

  let originDragPoint: Phaser.Math.Vector2 | undefined;

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

  world.registerDisposer(() => {
    scene.scriptManager.remove(handleCameraMovement);
  });
};

export default setupCameraMovement;
