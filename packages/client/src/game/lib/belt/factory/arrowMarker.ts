import { AsteroidMap } from "@game/constants";
import { GameObjectComponent } from "engine/types";

export const createArrowMarker = (options: {
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
  function drawTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.fillStyle(color, alpha);
    gameObject.lineStyle(1, color);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
  }

  function drawArrow(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.lineStyle(2, color);
    gameObject.moveTo(tileWidth / 2, -tileHeight / 4);
    gameObject.lineTo(tileWidth / 2, -tileHeight);
    gameObject.moveTo(tileWidth / 2 + 1, -tileHeight / 4);
    gameObject.lineTo(tileWidth / 4, -tileHeight / 2);
    gameObject.moveTo(tileWidth / 2 - 1, -tileHeight / 4);
    gameObject.lineTo(tileWidth - tileWidth / 4, -tileHeight / 2);
    // gameObject.lineTo(0, -tileHeight / 3);
    // gameObject.moveTo(tileWidth / 2, -tileHeight);
    // gameObject.lineTo(tileWidth, -tileHeight / 3);
    gameObject.strokePath();
  }

  return {
    id,
    once: (gameObject) => {
      gameObject.x = Math.floor(x / tileWidth) * tileWidth;
      gameObject.y = Math.floor(y / tileHeight) * tileHeight;
      gameObject.setDepth(AsteroidMap.DepthLayers.Marker);

      gameObject.clear();
      drawTile(gameObject);
      drawArrow(gameObject);

      gameObject.setDepth(400);
    },
  };
};
