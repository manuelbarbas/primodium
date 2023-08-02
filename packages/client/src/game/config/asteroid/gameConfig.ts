import { ASSET_PACK, AsteroidMap } from "@game/constants";
import { GameConfig } from "engine/types";

const RENDER_RESOLUTION = 1;

const gameConfig: GameConfig = {
  key: AsteroidMap.KEY,
  type: Phaser.WEBGL,
  parent: "phaser-container",
  backgroundColor: "64748b",
  width: window.innerWidth * window.devicePixelRatio * RENDER_RESOLUTION,
  height: window.innerHeight * window.devicePixelRatio * RENDER_RESOLUTION,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  fps: {
    deltaHistory: 60,
  },
  // autoFocus: true,
  autoRound: true,
  transparent: true,
  pixelArt: true,
  assetPackUrl: ASSET_PACK,
};

export default gameConfig;
