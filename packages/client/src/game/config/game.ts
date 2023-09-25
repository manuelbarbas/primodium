import { ASSET_PACK, KEY } from "@game/constants";
import { GameConfig } from "engine/types";

const gameConfig: GameConfig = {
  key: KEY,
  type: Phaser.WEBGL,
  parent: "phaser-container",
  backgroundColor: "64748b",
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.ENVELOP,
    autoCenter: Phaser.Scale.CENTER_BOTH,
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
