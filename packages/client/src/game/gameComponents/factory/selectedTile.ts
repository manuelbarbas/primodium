import { GameObjectComponent } from "../../../engine/types";

export const createSelectedTile = (
  x: number,
  y: number,
  tileHeight: number,
  tileWidth: number
): GameObjectComponent<"Graphics"> => {
  function drawSelectedTile(gameObject: Phaser.GameObjects.Graphics) {
    gameObject.fillStyle(0xffff00, 0.3);
    gameObject.lineStyle(1, 0xffff00);
    gameObject.strokeRect(0, 0, tileHeight, tileWidth);
    gameObject.fillRect(0, 0, tileWidth, tileHeight);
    gameObject.setDepth(200);
  }

  // function animateBorder(
  //   gameObject: Phaser.GameObjects.Graphics,
  //   time: number,
  //   delta: number
  // ) {
  //   gameObject.lineStyle(
  //     0.5 * Math.sin(2 * Math.PI * 1 * time * delta) + 1,
  //     0xffff00
  //   );
  //   gameObject.strokeRect(0, 0, tileWidth, tileHeight);
  // }

  return {
    id: "selectedTile",
    once: (gameObject) => {
      gameObject.x = Math.floor(x / tileWidth) * tileWidth;
      gameObject.y = Math.floor(y / tileHeight) * tileHeight;

      gameObject.clear();
      drawSelectedTile(gameObject);
    },
    // update: (gameObject, time, delta) => {
    //   gameObject.clear();
    //   drawHoverTile(gameObject);
    //   // animateBorder(gameObject, time, delta);
    // },
  };
};
