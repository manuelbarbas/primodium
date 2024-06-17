import { GameConfig } from "@primodiumxyz/engine/types";
import { Pack } from "@primodiumxyz/assets";

import { KEY } from "@/lib/constants/common";

const gameConfig: GameConfig = {
  key: KEY,
  type: Phaser.WEBGL,
  parent: "phaser-container",
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  antialias: false,
  antialiasGL: false,
  roundPixels: true,
  transparent: true,
  pixelArt: true,
  assetPack: Pack,
  dom: {
    createContainer: true,
    pointerEvents: "none",
  },
};

export default gameConfig;
