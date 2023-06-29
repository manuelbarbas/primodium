import { GameObjectComponent } from "../../../engine/types";

export const createSelectionTile = (
  x: number,
  y: number,
  tileHeight: number,
  tileWidth: number,
  color: number = 0xffff00
): GameObjectComponent<"Graphics"> => {
  function drawSelectedTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.fillStyle(color, 0.3);
    gameObject.lineStyle(1, color);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(200);
  }

  return {
    id: "selectedTile",
    once: (gameObject) => {
      gameObject.x = Math.floor(x / tileWidth) * tileWidth;
      gameObject.y = Math.floor(y / tileHeight) * tileHeight;

      gameObject.clear();
      drawSelectedTile(gameObject);
    },
  };
};
