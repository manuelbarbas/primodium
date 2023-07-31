import { AsteroidMap } from "@game/constants";
import { GameObjectComponent } from "engine/types";

interface Circle {
  x: number;
  y: number;
  movingVertically: boolean;
  startTime: number;
}

interface Options {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  speed?: number;
  circleCount?: number;
  circleRadius?: number;
  color?: number;
  highlight?: boolean;
  tileWidth?: number;
  tileHeight?: number;
  lineWidth?: number;
  dashed?: boolean;
}

const createCircle = (x: number, y: number, startTime: number): Circle => ({
  x,
  y,
  movingVertically: true,
  startTime,
});

const drawPath = (
  gameObject: Phaser.GameObjects.Graphics,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: number,
  lineWidth: number
) => {
  gameObject.lineStyle(lineWidth, color, 0.7);
  gameObject.moveTo(0, 0);
  gameObject.lineTo(0, endY - startY);
  gameObject.lineTo(endX - startX, endY - startY);
  gameObject.stroke();
};

const drawDashedPath = (
  gameObject: Phaser.GameObjects.Graphics,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  color: number,
  lineWidth: number,
  dashLength: number,
  spaceLength: number
) => {
  gameObject.lineStyle(lineWidth, color, 0.7);

  // calculate horizontal and vertical distances
  const dx = endX - startX;
  const dy = endY - startY;

  // relative coordinates
  let currentX = 0;
  let currentY = 0;
  let draw = true;

  // draw vertical segment
  while (Math.abs(currentY) < Math.abs(dy)) {
    let nextY = currentY + (draw ? dashLength : spaceLength) * Math.sign(dy);
    if (Math.abs(nextY) > Math.abs(dy)) {
      nextY = dy;
    }
    if (draw) {
      gameObject.moveTo(currentX, currentY);
      gameObject.lineTo(currentX, nextY);
    }
    currentY = nextY;
    draw = !draw;
  }

  // draw horizontal segment
  while (Math.abs(currentX) < Math.abs(dx)) {
    let nextX = currentX + (draw ? dashLength : spaceLength) * Math.sign(dx);
    if (Math.abs(nextX) > Math.abs(dx)) {
      nextX = dx;
    }
    if (draw) {
      gameObject.moveTo(currentX, currentY);
      gameObject.lineTo(nextX, currentY);
    }
    currentX = nextX;
    draw = !draw;
  }

  gameObject.stroke();
};

const drawTile = (
  gameObject: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  tileWidth: number,
  tileHeight: number,
  color: number
) => {
  gameObject.fillStyle(color, 0.3);
  gameObject.lineStyle(1, color);
  gameObject.strokeRect(
    x - tileWidth / 2,
    y - tileHeight / 2,
    tileHeight,
    tileWidth
  );
  gameObject.fillRect(
    x - tileWidth / 2,
    y - tileHeight / 2,
    tileWidth,
    tileHeight
  );
};

const moveCircle = (
  circle: Circle,
  delta: number,
  currentTime: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  speed: number
) => {
  if (currentTime < circle.startTime) return;

  const direction = circle.movingVertically
    ? startY < endY
      ? 1
      : -1
    : startX < endX
    ? 1
    : -1;

  if (circle.movingVertically) {
    circle.y += direction * speed * delta;
    if (direction === 1 ? circle.y >= endY : circle.y <= endY) {
      circle.y = endY;
      circle.movingVertically = false;
    }
  } else {
    circle.x += direction * speed * delta;
    if (direction === 1 ? circle.x >= endX : circle.x <= endX) {
      circle.x = startX;
      circle.y = startY;
      circle.movingVertically = true;
    }
  }
};

const drawCircle = (
  gameObject: Phaser.GameObjects.Graphics,
  circle: Circle,
  color: number,
  circleRadius: number
) => {
  gameObject.fillStyle(color);
  gameObject.fillCircle(
    circle.x - gameObject.x,
    circle.y - gameObject.y,
    circleRadius
  );
};

export const createPath = (
  options: Options
): GameObjectComponent<"Graphics"> => {
  const {
    id,
    startX,
    startY,
    endX,
    endY,
    speed = 20,
    circleCount = 1,
    circleRadius = 2,
    color = 0xffffff,
    highlight = false,
    tileWidth = 16,
    tileHeight = 16,
    lineWidth = 1,
    dashed = false,
  } = options;
  const circles: Circle[] = [];

  return {
    id,
    // will be called on spawn
    once: (gameObject) => {
      gameObject.clear();
      gameObject.x = startX;
      gameObject.y = startY;
      gameObject.setDepth(AsteroidMap.DepthLayers.Path);

      if (!circles.length) {
        const delay = 2000;
        for (let i = 0; i < circleCount; i++) {
          circles.push(createCircle(startX, startY, i * delay));
        }
      }
    },
    // will be called on game tick
    update: (gameObject, time, delta) => {
      gameObject.clear();

      if (dashed) {
        drawDashedPath(
          gameObject,
          startX,
          startY,
          endX,
          endY,
          color,
          lineWidth,
          5,
          5
        );
      } else {
        drawPath(gameObject, startX, startY, endX, endY, color, lineWidth);
      }

      if (highlight) {
        drawTile(gameObject, 0, 0, tileWidth, tileHeight, color);
        drawTile(
          gameObject,
          endX - startX,
          endY - startY,
          tileWidth,
          tileHeight,
          color
        );
      }

      // Update and draw each circle
      circles.forEach((circle) => {
        moveCircle(
          circle,
          delta / 1000,
          time,
          startX,
          startY,
          endX,
          endY,
          speed
        );
        drawCircle(gameObject, circle, color, circleRadius);
      });
    },
  };
};
