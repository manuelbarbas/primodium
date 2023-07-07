import { engine } from "@engine/api";
import {
  coordEq,
  pixelCoordToTileCoord,
  tileCoordToPixelCoord,
} from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";

/**
 * Pans the camera to the specified coordinate.
 * @param {Coord} coord The coordinate to pan to.
 * @param {number} [duration=1000] The duration of the pan animation in milliseconds.
 * @param {string} [ease="Power2"] The easing function to use for the pan animation.
 * @param {Scenes} [targetScene=Scenes.Main] The scene to pan the camera in.
 */
export const pan = (
  coord: Coord,
  duration: number = 1000,
  ease: string = "Power2",
  targetScene: string = "Main"
) => {
  const { phaserScene, camera, tilemap } = engine
    .getGame()
    ?.sceneManager.scenes.get(targetScene)!;

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
    const currentTween = phaserScene.tweens.getTweensOf(camera.phaserCamera)[0];

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
};

/**
 * Gets the current position of the camera in tile coords.
 * @param {Scenes} [targetScene=Scenes.Main] The scene to get the camera position from.
 * @returns {Coord} The current position of the camera.
 */
export const getPosition = (targetScene: string = "Main") => {
  const { camera, tilemap } = engine
    .getGame()
    ?.sceneManager.scenes.get(targetScene)!;

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
};

/**
 * Makes sure updates the world view of the camera are sent for observable listeners.
 * @param {Scenes} [targetScene=Scenes.Main] The scene to update the camera world view in.
 */
export const updateWorldView = (targetScene: string = "Main") => {
  const { camera } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  requestAnimationFrame(() =>
    camera?.worldView$.next(camera.phaserCamera.worldView)
  );
};
