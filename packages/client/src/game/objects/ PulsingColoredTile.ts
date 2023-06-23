import { Coord } from "@latticexyz/utils";

export class PulsingColoredTile extends Phaser.GameObjects.Graphics {
  constructor(scene: Phaser.Scene, coord: Coord, color: number) {
    super(scene, {
      x: coord.x,
      y: coord.y,
      fillStyle: { color },
      lineStyle: { width: 1, color },
    });
  }
}
