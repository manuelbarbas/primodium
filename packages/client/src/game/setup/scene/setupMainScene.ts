import createScene from "../../helpers/createScene";
import { GameConfig } from "../../../util/types";
import { Scenes } from "../../constants";
import type { createPhaserGame } from "@smallbraingames/small-phaser";

const setupMainScene = async (
  phaserGame: Awaited<ReturnType<typeof createPhaserGame>>,
  config: GameConfig
) => {
  const {
    camera: { minZoom, maxZoom, pinchSpeed, scrollSpeed },
    tilemap: { chunkSize, tileHeight, tileWidth },
  } = config;

  const scene = await createScene(phaserGame, {
    key: Scenes.Main,
    assetPackUrl: "assets/pack",
    camera: {
      minZoom,
      maxZoom,
      pinchSpeed,
      scrollSpeed,
      defaultZoom: minZoom,
    },
    tilemap: {
      chunkSize,
      tileWidth,
      tileHeight,
    },
  });

  return scene;
};

export default setupMainScene;
