import { DepthLayers } from "@game/constants";
import { GameObjectComponent } from "../../../engine/types";

interface Triangle {
  x: number;
  y: number;
}

const createTriangle = (x: number, y: number): Triangle => ({
  x,
  y,
});

// Function to draw a tile
const drawTile = (
  gameObject: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  tileHeight: number,
  tileWidth: number,
  color: number
) => {
  gameObject.fillStyle(color, 0.3);
  gameObject.lineStyle(1, color);
  gameObject.strokeRect(x, y, tileHeight, tileWidth);
  gameObject.fillRect(x, y, tileWidth, tileHeight);
};

// Function to draw a path line
const drawPath = (
  gameObject: Phaser.GameObjects.Graphics,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  tileWidth: number,
  tileHeight: number,
  color: number
) => {
  gameObject.lineStyle(1, color, 0.7);
  const offsetX = tileWidth / 2;
  const offsetY = tileHeight / 2;
  gameObject.moveTo(offsetX, offsetY);
  gameObject.lineTo(endX - startX + offsetX, endY - startY + offsetY);
  gameObject.stroke();
};

const drawDashedPath = (
  gameObject: Phaser.GameObjects.Graphics,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  tileWidth: number,
  tileHeight: number,
  color: number
) => {
  gameObject.lineStyle(1.5, color, 0.7);

  const offsetX = tileWidth / 2;
  const offsetY = tileHeight / 2;

  const dx = endX - startX;
  const dy = endY - startY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const dashSize = 8;
  const gapSize = 8;

  const dirX = dx / distance;
  const dirY = dy / distance;

  const adjustedStartX = offsetX;
  const adjustedStartY = offsetY;

  for (let i = 0; i < distance; i += dashSize + gapSize) {
    const dashEnd = Math.min(i + dashSize, distance);
    const x1 = adjustedStartX + dirX * i;
    const y1 = adjustedStartY + dirY * i;
    const x2 = adjustedStartX + dirX * dashEnd;
    const y2 = adjustedStartY + dirY * dashEnd;
    gameObject.moveTo(x1, y1);
    gameObject.lineTo(x2, y2);
  }

  gameObject.strokePath();
};

// Function to draw a triangle
const drawTriangle = (
  gameObject: Phaser.GameObjects.Graphics,
  triangleX: number,
  triangleY: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  tileWidth: number,
  tileHeight: number,
  color: number
) => {
  const offsetX = tileWidth / 2;
  const offsetY = tileHeight / 2;
  const dx = endX - startX;
  const dy = endY - startY;
  const angle = Math.atan2(dy, dx);
  const size = 8;
  const halfBase = size / 2;

  const tipX = triangleX - gameObject.x + offsetX + Math.cos(angle) * size;
  const tipY = triangleY - gameObject.y + offsetY + Math.sin(angle) * size;
  const leftBaseX =
    triangleX -
    gameObject.x +
    offsetX +
    Math.cos(angle + Math.PI / 2) * halfBase;
  const leftBaseY =
    triangleY -
    gameObject.y +
    offsetY +
    Math.sin(angle + Math.PI / 2) * halfBase;
  const rightBaseX =
    triangleX -
    gameObject.x +
    offsetX +
    Math.cos(angle - Math.PI / 2) * halfBase;
  const rightBaseY =
    triangleY -
    gameObject.y +
    offsetY +
    Math.sin(angle - Math.PI / 2) * halfBase;

  gameObject.fillStyle(color);
  gameObject.fillTriangle(
    leftBaseX,
    leftBaseY,
    rightBaseX,
    rightBaseY,
    tipX,
    tipY
  );
  gameObject.setZ(300);
};

export const createAttackPath = (options: {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  tileHeight: number;
  tileWidth: number;
  triangleCount?: number;
  color?: number;
  dashed?: boolean;
}): GameObjectComponent<"Graphics"> => {
  const {
    id,
    startX,
    startY,
    endX,
    endY,
    tileHeight,
    tileWidth,
    triangleCount = 1,
    color = 0xff0000,
    dashed = true,
  } = options;
  const triangles: Triangle[] = [];

  return {
    id,
    // will be called on spawn
    once: (gameObject) => {
      gameObject.clear();
      gameObject.x = startX;
      gameObject.y = startY;
      gameObject.setDepth(DepthLayers.Tooltip);

      //we dont want to render at the start and end of the path
      const nTriangles = triangleCount + 2;

      // initialize triangles and distribute them evenly across the line
      const dx = endX - startX;
      const dy = endY - startY;
      for (let i = 1; i < nTriangles - 1; i++) {
        const ratio = i / (nTriangles - 1);
        const x = startX + dx * ratio;
        const y = startY + dy * ratio;
        triangles.push(createTriangle(x, y));
      }

      // Draw path, triangles, and tiles
      if (dashed) {
        drawDashedPath(
          gameObject,
          startX,
          startY,
          endX,
          endY,
          tileWidth,
          tileHeight,
          color
        );
      } else {
        drawPath(
          gameObject,
          startX,
          startY,
          endX,
          endY,
          tileWidth,
          tileHeight,
          color
        );
      }

      triangles.forEach((triangle) =>
        drawTriangle(
          gameObject,
          triangle.x,
          triangle.y,
          startX,
          startY,
          endX,
          endY,
          tileWidth,
          tileHeight,
          color
        )
      );
      drawTile(gameObject, 0, 0, tileHeight, tileWidth, color);
      drawTile(
        gameObject,
        endX - startX,
        endY - startY,
        tileHeight,
        tileWidth,
        color
      );
    },
  };
};
