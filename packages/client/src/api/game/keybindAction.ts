import { useConfigStore } from "../../store/ConfigStore";
import { useGameStore } from "../../store/GameStore";
import * as game from "../game/index";
import * as util from "../util";

export const centerCamera = () => {
  game.camera.pan({ x: 0, y: 0 });
};

export const zoomIn = () => {
  const camera = useGameStore.getState().game?.mainScene.camera!;
  const { maxZoom, zoomStep } = useConfigStore.getState().camera;

  const currZoom = camera.phaserCamera.zoom;
  game.camera.zoomTo(Math.min(currZoom + zoomStep, maxZoom), 100);
};

export const zoomOut = () => {
  const camera = useGameStore.getState().game?.mainScene.camera!;
  const { minZoom, zoomStep } = useConfigStore.getState().camera;

  const currZoom = camera.phaserCamera.zoom;
  game.camera.zoomTo(Math.max(currZoom - zoomStep, minZoom), 100);
};

export const cameraMoveUp = () => {
  const currPos = game.camera.getPosition();
  game.camera.setPosition({ x: currPos.x, y: currPos.y + 1 });
};

export const cameraMoveDown = () => {
  const currPos = game.camera.getPosition();
  game.camera.setPosition({ x: currPos.x, y: currPos.y - 1 });
};

export const cameraMoveLeft = () => {
  const currPos = game.camera.getPosition();
  game.camera.setPosition({ x: currPos.x - 1, y: currPos.y });
};

export const cameraMoveRight = () => {
  const currPos = game.camera.getPosition();
  game.camera.setPosition({ x: currPos.x + 1, y: currPos.y });
};
