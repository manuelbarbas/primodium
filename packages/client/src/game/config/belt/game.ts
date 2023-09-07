import { ASSET_PACK, BeltMap } from "@game/constants";
import { GameConfig } from "engine/types";

const gameConfig: GameConfig = {
  key: BeltMap.KEY,
  type: Phaser.WEBGL,
  parent: "",
  backgroundColor: "64748b",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  antialias: false,
  antialiasGL: false,
  desynchronized: true,
  autoMobilePipeline: true,
  premultipliedAlpha: true,
  autoRound: true,
  transparent: true,
  pixelArt: true,
  assetPackUrl: ASSET_PACK,
};

export default gameConfig;
