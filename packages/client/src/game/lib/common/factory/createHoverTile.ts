import { AsteroidMap } from "@game/constants";
import { GameObjectComponent } from "engine/types";

export const createHoverTile = (options: {
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
    color = 0xffffff,
    alpha = 0.2,
  } = options;
  function drawHoverTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.fillStyle(color, alpha);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(AsteroidMap.DepthLayers.Tooltip);
  }

  return {
    id,
    once: (gameObject) => {
      gameObject.x = Math.floor(x / tileWidth) * tileWidth;
      gameObject.y = Math.floor(y / tileHeight) * tileHeight;

      gameObject.clear();
      drawHoverTile(gameObject);
    },
  };
};
