import {
  coordEq,
  pixelCoordToTileCoord,
  tileCoordToPixelCoord,
} from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";
import { Scene } from "engine/types";

export const createCameraApi = (targetScene: Scene) => {
  function pan(coord: Coord, duration: number = 1000, ease: string = "Power2") {
    const { phaserScene, camera, tilemap } = targetScene;

    const pixelCoord = tileCoordToPixelCoord(
      coord,
      tilemap.tileWidth,
      tilemap.tileHeight
    );

    const scroll = camera.phaserCamera.getScroll(
      pixelCoord.x + tilemap.tileWidth / 2,
      -pixelCoord.y + tilemap.tileWidth / 2
    );

    //we want new tween to be active for responsive behavior. New tween are created if on new end coord.
    if (phaserScene.tweens.getTweensOf(camera.phaserCamera).length) {
      const currentTween = phaserScene.tweens.getTweensOf(
        camera.phaserCamera
      )[0];

      const endCoord = {
        //@ts-ignore
        x: currentTween.data[0].end,
        //@ts-ignore
        y: currentTween.data[1].end,
      };

      if (coordEq(endCoord, scroll)) return;

      phaserScene.tweens.killTweensOf(camera.phaserCamera);
    }

    phaserScene?.tweens.add({
      targets: camera.phaserCamera,
      scrollX: scroll.x,
      scrollY: scroll.y,
      duration,
      ease,
      onUpdate: () => {
        updateWorldView();
      },
    });
  }

  function getPosition() {
    const { camera, tilemap } = targetScene;

    const { centerX: x, centerY: y } = camera?.phaserCamera.worldView!;

    const tileCoord = pixelCoordToTileCoord(
      { x, y },
      tilemap.tileWidth,
      tilemap.tileHeight
    );

    return {
      x: tileCoord.x,
      y: -tileCoord.y,
    };
  }

  function updateWorldView() {
    const { camera } = targetScene;

    requestAnimationFrame(() =>
      camera?.worldView$.next(camera.phaserCamera.worldView)
    );
  }

  const shake = () => {
    const { camera } = targetScene;

    camera.phaserCamera.shake(200, 0.001 / camera.phaserCamera.zoom, true);
  };

  return {
    pan,
    getPosition,
    updateWorldView,
    shake,
  };
};
