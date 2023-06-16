import { Coord } from "@latticexyz/utils";

import { useGameStore } from "../../store/GameStore";
import * as util from "../util";
import { useConfigStore } from "../../store/ConfigStore";

export const pan = (
  coord: Coord,
  duration: number = 1000,
  ease: string = "Power2"
) => {
  const camera = useGameStore.getState().game?.mainScene.camera;

  const pixelCoord = util.gameCoordToPixelCoord(coord);

  camera?.phaserCamera.pan(pixelCoord.x, pixelCoord.y, duration, ease);
};

export const setPosition = (coord: Coord) => {
  const camera = useGameStore.getState().game?.mainScene.camera;

  const pixelCoord = util.gameCoordToPixelCoord(coord);

  camera?.phaserCamera.centerOn(pixelCoord.x, pixelCoord.y);
};

export const getPosition = () => {
  const camera = useGameStore.getState().game?.mainScene.camera;

  const { centerX: x, centerY: y } = camera?.phaserCamera.worldView!;

  return util.pixelCoordToGameCoord({ x, y });
};

export const setZoom = (zoom: number) => {
  const camera = useGameStore.getState().game?.mainScene.camera;

  camera?.phaserCamera.setZoom(zoom);
};

export const zoomTo = (
  zoom: number,
  duration: number = 500,
  ease: string = "Power2"
) => {
  const { minZoom, maxZoom } = useConfigStore.getState().camera;
  const camera = useGameStore.getState().game?.mainScene.camera;

  //clamp zoom based on min and max zoom
  zoom = Math.max(zoom, minZoom);
  zoom = Math.min(zoom, maxZoom);

  camera?.phaserCamera.zoomTo(zoom, duration, ease);
};
