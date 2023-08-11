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

function drawPath(
  gameObject: Phaser.GameObjects.Graphics,
  start: Coord,
  end: Coord,
  color: number,
  lineWidth: number
) {
  const _start = getRelativeCoord(gameObject, start);

  const _end = getRelativeCoord(gameObject, end);

  gameObject.lineStyle(lineWidth, color, 0.7);

  //draw vertical segment
  gameObject.moveTo(_start.x, _start.y);
  gameObject.lineTo(_start.x, _end.y);

  gameObject.lineTo(_end.x, _end.y);
  gameObject.stroke();
}

function drawDashedPath(
  gameObject: Phaser.GameObjects.Graphics,
  start: Coord,
  end: Coord,
  color: number,
  lineWidth: number,
  dashLength: number,
  spaceLength: number
) {
  const _start = getRelativeCoord(gameObject, start);

  const _end = getRelativeCoord(gameObject, end);

  gameObject.lineStyle(lineWidth, color, 0.7);

  // calculate horizontal and vertical distances
  const dx = _end.x - _start.x;
  const dy = _end.y - _start.y;

  // relative coordinates
  let currentX = _start.x;
  let currentY = _start.y;
  let draw = true;

  // draw vertical segment
  while (Math.abs(currentY - _start.y) < Math.abs(dy)) {
    let nextY = currentY + (draw ? dashLength : spaceLength) * Math.sign(dy);
    if (Math.abs(nextY - _start.y) > Math.abs(dy)) {
      nextY = _end.y;
    }
    if (draw) {
      gameObject.moveTo(currentX, currentY);
      gameObject.lineTo(currentX, nextY);
    }
    currentY = nextY;
    draw = !draw;
  }

  // draw horizontal segment
  while (Math.abs(currentX - _start.x) < Math.abs(dx)) {
    let nextX = currentX + (draw ? dashLength : spaceLength) * Math.sign(dx);
    if (Math.abs(nextX - _start.x) > Math.abs(dx)) {
      nextX = _end.x;
    }
    if (draw) {
      gameObject.moveTo(currentX, currentY);
      gameObject.lineTo(nextX, currentY);
    }
    currentX = nextX;
    draw = !draw;
  }

  gameObject.stroke();
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

export const ManhattanPath = (
  desitination: Coord,
  options: {
    start?: Coord;
    id?: string;
    color?: number;
    thickness?: number;
    dashed?: boolean;
  } = {}
): GameObjectComponent<"Graphics"> => {
  const {
    id,
    color = 0xffffff,
    thickness = 1.5,
    start,
    dashed = false,
  } = options;

  return {
    id: id ?? `square_${uuid()}`,
    once: (gameObject) => {
      dashed
        ? drawDashedPath(
            gameObject,
            start ? start : { x: gameObject.x, y: gameObject.y },
            desitination,
            color,
            thickness,
            3,
            2
          )
        : drawPath(
            gameObject,
            start ? start : { x: gameObject.x, y: gameObject.y },
            desitination,
            color,
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
