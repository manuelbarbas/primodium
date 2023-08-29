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
