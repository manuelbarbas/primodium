import { engine } from "@engine/api";
import { Scenes } from "@game/constants";
import {
  coordEq,
  pixelCoordToTileCoord,
  tileCoordToPixelCoord,
} from "@latticexyz/phaserx";
import { Coord } from "@latticexyz/utils";

export const pan = (
  coord: Coord,
  duration: number = 1000,
  ease: string = "Power2",
  targetScene: string = Scenes.Main
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

export const getPosition = (targetScene: string = Scenes.Main) => {
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

export const updateWorldView = (targetScene: string = Scenes.Main) => {
  const { camera } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  requestAnimationFrame(() =>
    camera?.worldView$.next(camera.phaserCamera.worldView)
  );
};

export const shake = (targetScene: string = Scenes.Main) => {
  const { camera } = engine.getGame()?.sceneManager.scenes.get(targetScene)!;

  camera.phaserCamera.shake(200, 0.001 / camera.phaserCamera.zoom, true);
};
