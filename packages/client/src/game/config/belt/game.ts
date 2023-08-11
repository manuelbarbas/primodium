import { ASSET_PACK, BeltMap } from "@game/constants";
import { GameConfig } from "engine/types";

const RENDER_RESOLUTION = 1;

const gameConfig: GameConfig = {
  key: BeltMap.KEY,
  type: Phaser.WEBGL,
  parent: "",
  backgroundColor: "64748b",
  width: window.innerWidth * window.devicePixelRatio * RENDER_RESOLUTION,
  height: window.innerHeight * window.devicePixelRatio * RENDER_RESOLUTION,
  scale: {
    mode: Phaser.Scale.NONE,
  },
  autoRound: true,
  transparent: true,
  pixelArt: true,
  assetPackUrl: ASSET_PACK,
};

export default gameConfig;
