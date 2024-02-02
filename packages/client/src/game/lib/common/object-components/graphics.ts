import { Coord, uuid } from "@latticexyz/utils";
import { GameObjectComponent } from "engine/types";

function getRelativeCoord(gameObject: Phaser.GameObjects.Graphics, coord: Coord) {
  return {
    x: coord.x - gameObject.x,
    y: coord.y - gameObject.y,
  };
}

function drawLine(
  gameObject: Phaser.GameObjects.Graphics,
  start: Coord,
  end: Coord,
  color: number,
  alpha: number,
  thickness: number
) {
  const startPos = getRelativeCoord(gameObject, start);
  const endPos = getRelativeCoord(gameObject, end);

  gameObject.lineStyle(thickness, color, alpha);
  gameObject.beginPath();
  gameObject.moveTo(startPos.x, startPos.y);
  gameObject.lineTo(endPos.x, endPos.y);
  gameObject.closePath();
  gameObject.strokePath();
}

function drawCircle(
  gameObject: Phaser.GameObjects.Graphics,
  position: Coord,
  radius: number,
  color: number,
  alpha: number,
  borderThickness: number
) {
  const pos = getRelativeCoord(gameObject, position);

  gameObject.fillStyle(color, alpha);
  gameObject.lineStyle(borderThickness, color);
  gameObject.strokeCircle(pos.x, pos.y, radius);
  gameObject.fillCircle(pos.x, pos.y, radius);
}

function calculateTrianglePoints(baseWidth: number, height: number, directionDegrees: number, origin: Coord) {
  // Convert direction from degrees to radians
  const directionRadians = ((directionDegrees % 360) * Math.PI) / 180;

  // Calculate the midpoint of the base
  const baseMidpoint = {
    x: origin.x + height * Math.sin(directionRadians),
    y: origin.y + height * Math.cos(directionRadians),
  };

  // Calculate the change in x and y for half the base width
  const deltaX = (baseWidth / 2) * Math.cos(directionRadians);
  const deltaY = (baseWidth / 2) * Math.sin(directionRadians);

  // Calculate the three points of the triangle
  const pointA = { x: baseMidpoint.x - deltaX, y: baseMidpoint.y + deltaY }; // Left base point
  const pointB = { x: baseMidpoint.x + deltaX, y: baseMidpoint.y - deltaY }; // Right base point
  const pointC = { x: origin.x, y: origin.y }; // Apex point

  return { a: pointA, b: pointB, c: pointC };
}

function drawTriangle(
  gameObject: Phaser.GameObjects.Graphics,
  {
    position,
    width,
    height,
    directionDegrees = 0,
    color,
    alpha,
    borderThickness,
  }: {
    position: Coord;
    width: number;
    height: number;
    directionDegrees?: number;
    color: number;
    alpha: number;
    borderThickness: number;
  }
) {
  gameObject.fillStyle(color, alpha);
  gameObject.lineStyle(borderThickness, color);
  // this should take in 3 points
  const pos = getRelativeCoord(gameObject, position);

  const pts = calculateTrianglePoints(width, height, directionDegrees, pos);

  gameObject.fillStyle(color, alpha);
  gameObject.lineStyle(borderThickness, color);
  gameObject.strokeTriangle(pts.a.x, pts.a.y, pts.b.x, pts.b.y, pts.c.x, pts.c.y);
  gameObject.fillTriangle(pts.a.x, pts.a.y, pts.b.x, pts.b.y, pts.c.x, pts.c.y);
}

function drawSquare(
  gameObject: Phaser.GameObjects.Graphics,
  position: Coord,
  width: number,
  height: number,
  color: number,
  alpha: number,
  borderThickness: number
) {
  const pos = getRelativeCoord(gameObject, position);

  gameObject.fillStyle(color, alpha);
  gameObject.lineStyle(borderThickness, color);
  gameObject.strokeRect(pos.x, pos.y, width, height);
  gameObject.fillRect(pos.x, pos.y, width, height);
}

export const Line = (
  end: Coord,
  options: {
    id?: string;
    color?: number;
    alpha?: number;
    thickness?: number;
  } = {}
): GameObjectComponent<"Graphics"> => {
  const { id, color = 0xffffff, alpha = 0.3, thickness = 1 } = options;

  return {
    id: id ?? `line_${uuid()}`,
    once: (gameObject) => {
      drawLine(gameObject, { x: gameObject.x, y: gameObject.y }, end, color, alpha, thickness);
    },
  };
};

export const Square = (
  width: number,
  height: number,
  options: {
    position?: Coord;
    id?: string;
    color?: number;
    alpha?: number;
    borderThickness?: number;
  } = {}
): GameObjectComponent<"Graphics"> => {
  const { position, id, color = 0xffffff, alpha = 0.3, borderThickness = 1 } = options;

  return {
    id: id ?? `square_${uuid()}`,
    once: (gameObject) => {
      drawSquare(
        gameObject,
        position ?? { x: gameObject.x, y: gameObject.y },
        width,
        height,
        color,
        alpha,
        borderThickness
      );
    },
  };
};

export const Circle = (
  radius: number,
  options: {
    position?: Coord;
    id?: string;
    color?: number;
    alpha?: number;
    borderThickness?: number;
  } = {}
): GameObjectComponent<"Graphics"> => {
  const { position, id, color = 0xffffff, alpha = 0.3, borderThickness = 1 } = options;

  return {
    id: id ?? `circle_${uuid()}`,
    once: (gameObject) => {
      drawCircle(gameObject, position ?? { x: gameObject.x, y: gameObject.y }, radius, color, alpha, borderThickness);
    },
  };
};

export const Triangle = (
  width: number,
  height: number,
  options: {
    position?: Coord;
    direction?: number;
    id?: string;
    color?: number;
    alpha?: number;
    borderThickness?: number;
  } = {}
): GameObjectComponent<"Graphics"> => {
  const { position, id, color = 0xffffff, alpha = 0.3, borderThickness = 1, direction = 0 } = options;

  return {
    id: id ?? `triangle_${uuid()}`,
    once: (gameObject) => {
      drawTriangle(gameObject, {
        position: position ?? { x: gameObject.x, y: gameObject.y },
        width,
        height,
        directionDegrees: direction,
        color,
        alpha,
        borderThickness,
      });
    },
  };
};
