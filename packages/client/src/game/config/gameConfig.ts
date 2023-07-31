import { Assets } from "@game/constants";
import { GameConfig } from "engine/types";

const RENDER_RESOLUTION = 1;

const gameConfig: GameConfig = {
  type: Phaser.WEBGL,
  parent: "phaser-container",
  fullscreenTarget: "starmap",
  backgroundColor: "64748b",
  width: window.innerWidth * window.devicePixelRatio * RENDER_RESOLUTION,
  height: window.innerHeight * window.devicePixelRatio * RENDER_RESOLUTION,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  autoFocus: true,
  desynchronized: true,
  preserveDrawingBuffer: true,
  autoRound: true,
  transparent: true,
  pixelArt: true,
  assetPackUrl: Assets.Pack,
};

export default gameConfig;
