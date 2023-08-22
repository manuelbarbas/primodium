import { ASSET_PACK, AsteroidMap } from "@game/constants";
import { GameConfig } from "engine/types";

const gameConfig: GameConfig = {
  key: AsteroidMap.KEY,
  type: Phaser.WEBGL,
  parent: "phaser-container",
  backgroundColor: "64748b",
  width: window.innerWidth * window.devicePixelRatio,
  height: window.innerHeight * window.devicePixelRatio,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  antialias: false,
  antialiasGL: false,
  desynchronized: true,
  autoMobilePipeline: true,
  premultipliedAlpha: true,
  // autoFocus: true,
  autoRound: true,
  transparent: true,
  pixelArt: true,
  assetPackUrl: ASSET_PACK,
};

export default gameConfig;
