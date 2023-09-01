import { Coord, uuid } from "@latticexyz/utils";
import { GameObjectComponent } from "engine/types";

function getRelativeCoord(
  gameObject: Phaser.GameObjects.Graphics,
  coord: Coord
) {
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
      drawLine(
        gameObject,
        { x: gameObject.x, y: gameObject.y },
        end,
        color,
        alpha,
        thickness
      );
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
  const {
    position,
    id,
    color = 0xffffff,
    alpha = 0.3,
    borderThickness = 1,
  } = options;

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
  const {
    position,
    id,
    color = 0xffffff,
    alpha = 0.3,
    borderThickness = 1,
  } = options;

  return {
    id: id ?? `circle_${uuid()}`,
    once: (gameObject) => {
      drawCircle(
        gameObject,
        position ?? { x: gameObject.x, y: gameObject.y },
        radius,
        color,
        alpha,
        borderThickness
      );
    },
  };
};
