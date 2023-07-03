import { DepthLayers } from "@game/constants";
import { GameObjectComponent } from "../../../engine/types";

export const createSelectionTile = (options: {
  id: string;
  x: number;
  y: number;
  tileHeight: number;
  tileWidth: number;
  color?: number;
  alpha?: number;
}): GameObjectComponent<"Graphics"> => {
  const {
    id,
    x,
    y,
    tileHeight,
    tileWidth,
    color = 0xffff00,
    alpha = 0.3,
  } = options;
  function drawSelectedTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.fillStyle(color, alpha);
    gameObject.lineStyle(1, color);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(DepthLayers.Tooltip);
  }

  return {
    id,
    once: (gameObject) => {
      gameObject.x = Math.floor(x / tileWidth) * tileWidth;
      gameObject.y = Math.floor(y / tileHeight) * tileHeight;

      gameObject.clear();
      drawSelectedTile(gameObject);
    },
  };
};
