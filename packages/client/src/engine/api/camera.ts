import { Coord } from "@latticexyz/utils";
import { useGameStore } from "../../store/GameStore";
import * as util from "./util";
import { useConfigStore } from "../../store/ConfigStore";

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
  const { scene, camera } =
    useGameStore.getState().game?.sceneManager.scenes[targetScene]!;
  const pixelCoord = util.gameCoordToPixelCoord(coord);
  const scroll = camera.phaserCamera.getScroll(pixelCoord.x, pixelCoord.y);

  scene?.tweens.add({
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
 * Sets the position of the camera to the specified coordinate.
 * @param {Coord} coord The coordinate to set the camera position to.
 * @param {Scenes} [targetScene=Scenes.Main] The scene to set the camera position in.
 */
export const setPosition = (coord: Coord, targetScene: string = "Main") => {
  const { camera } =
    useGameStore.getState().game?.sceneManager.scenes[targetScene]!;

  const pixelCoord = util.gameCoordToPixelCoord(coord);
  const scroll = camera.phaserCamera.getScroll(pixelCoord.x, pixelCoord.y);

  camera?.setScroll(scroll.x, scroll.y);
};

/**
 * Gets the current position of the camera.
 * @param {Scenes} [targetScene=Scenes.Main] The scene to get the camera position from.
 * @returns {Coord} The current position of the camera.
 */
export const getPosition = (targetScene: string = "Main") => {
  const { camera } =
    useGameStore.getState().game?.sceneManager.scenes[targetScene]!;

  const { centerX: x, centerY: y } = camera?.phaserCamera.worldView!;

  return util.pixelCoordToGameCoord({ x, y: -y });
};

/**
 * Sets the zoom level of the camera.
 * @param {number} zoom The zoom level to set.
 * @param {Scenes} [targetScene=Scenes.Main] The scene to set the camera zoom in.
 */
export const setZoom = (zoom: number, targetScene: string = "Main") => {
  const { camera } =
    useGameStore.getState().game?.sceneManager.scenes[targetScene]!;

  camera?.setZoom(zoom);
};

/**
 * Zooms the camera to the specified zoom level.
 * @param {number} zoom The zoom level to zoom to.
 * @param {number} [duration=500] The duration of the zoom animation in milliseconds.
 * @param {string} [ease="Power2"] The easing function to use for the zoom animation.
 * @param {Scenes} [targetScene=Scenes.Main] The scene to zoom the camera in.
 */
export const zoomTo = (
  zoom: number,
  duration: number = 500,
  ease: string = "Power2",
  targetScene: string = "Main"
) => {
  const { minZoom, maxZoom } = useConfigStore.getState().camera;
  const { camera } =
    useGameStore.getState().game?.sceneManager.scenes[targetScene]!;

  //clamp zoom based on min and max zoom
  zoom = Math.max(zoom, minZoom);
  zoom = Math.min(zoom, maxZoom);

  camera?.phaserCamera.zoomTo(zoom, duration, ease);
  updateWorldView();
};

/**
 * Makes sure updates the world view of the camera are sent for observable listeners.
 * @param {Scenes} [targetScene=Scenes.Main] The scene to update the camera world view in.
 */
export const updateWorldView = (targetScene: string = "Main") => {
  const { camera } =
    useGameStore.getState().game?.sceneManager.scenes[targetScene]!;

  requestAnimationFrame(() =>
    camera?.worldView$.next(camera.phaserCamera.worldView)
  );
};
