import { DepthLayers } from "@game/constants";
import { GameObjectComponent } from "engine/types";

interface Circle {
  x: number;
  y: number;
  movingVertically: boolean;
  startTime: number;
}

const createCircle = (x: number, y: number, startTime: number): Circle => ({
  x,
  y,
  movingVertically: true,
  startTime,
});

export const createSelectionPath = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  tileHeight: number,
  tileWidth: number,
  speed = 1,
  circleCount = 1,
  circleRadius = 2,
  color = 0xff00ff
): GameObjectComponent<"Graphics"> => {
  const circles: Circle[] = [];

  const drawPath = (gameObject: Phaser.GameObjects.Graphics) => {
    const offsetX = tileWidth / 2;
    const offsetY = tileHeight / 2;

    gameObject.lineStyle(1, color, 0.7);
    gameObject.moveTo(offsetX, offsetY);
    gameObject.lineTo(offsetX, endY - startY + offsetY);
    gameObject.lineTo(endX - startX + offsetX, endY - startY + offsetY);
    gameObject.stroke();
  };

  function drawTile(
    gameObject: Phaser.GameObjects.Graphics,
    x: number,
    y: number
  ) {
    gameObject.fillStyle(color, 0.3);
    gameObject.lineStyle(1, color);
    gameObject.strokeRect(x, y, tileHeight, tileWidth);
    gameObject.fillRect(x, y, tileWidth, tileHeight);
  }

  const moveCircle = (circle: Circle, delta: number, currentTime: number) => {
    if (currentTime < circle.startTime) {
      return;
    }

    if (circle.movingVertically) {
      const direction = startY < endY ? 1 : -1;
      circle.y += direction * speed * delta;
      if (
        (direction === 1 && circle.y >= endY) ||
        (direction === -1 && circle.y <= endY)
      ) {
        circle.y = endY;
        circle.movingVertically = false;
      }
    } else {
      const direction = startX < endX ? 1 : -1;
      circle.x += direction * speed * delta;
      if (
        (direction === 1 && circle.x >= endX) ||
        (direction === -1 && circle.x <= endX)
      ) {
        circle.x = startX;
        circle.y = startY;
        circle.movingVertically = true;
      }
    }
  };

  const drawCircle = (
    gameObject: Phaser.GameObjects.Graphics,
    circle: Circle
  ) => {
    const offsetX = tileWidth / 2;
    const offsetY = tileHeight / 2;

    gameObject.fillStyle(color);
    gameObject.fillCircle(
      circle.x - gameObject.x + offsetX,
      circle.y - gameObject.y + offsetY,
      circleRadius
    );
    gameObject.setZ(300);
  };

  return {
    id: "path",
    //will be called on spawn
    once: (gameObject) => {
      gameObject.clear();

      gameObject.x = startX;
      gameObject.y = startY;
      gameObject.setDepth(DepthLayers.Tooltip);

      //initialize circles if it has not been populated yet
      if (!circles.length) {
        const delay = 2000;
        for (let i = 0; i < circleCount; i++) {
          circles.push(createCircle(startX, startY, i * delay));
        }
      }
    },
    //will be called on game tick
    update: (gameObject, time, delta) => {
      gameObject.clear();
      drawPath(gameObject);

      // draw path start tile
      drawTile(gameObject, 0, 0);
      drawTile(gameObject, endX - startX, endY - startY);

      // Update and draw each circle
      circles.forEach((circle) => {
        moveCircle(circle, delta / 1000, time);
        drawCircle(gameObject, circle);
      });
    },
  };
};
