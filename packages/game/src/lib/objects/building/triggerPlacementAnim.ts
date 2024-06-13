import { Coord } from "@primodiumxyz/engine/types";
import { tileCoordToPixelCoord } from "@primodiumxyz/engine/lib/util/coords";
import { Dimensions } from "@primodiumxyz/core";

import { PrimodiumScene } from "@/api/scene";
import { Entity } from "@primodiumxyz/reactive-tables";

export const triggerPlacementAnim = (
  scene: PrimodiumScene,
  entity: Entity,
  mapCoord: Coord,
  dimensions: Dimensions
) => {
  const flare = (absoluteCoord: Coord, size = 1) => {
    scene.audio.play("Whoosh", "sfx", { rate: 2 });
    scene.phaserScene.add
      .particles(absoluteCoord.x, absoluteCoord.y, "flare", {
        speed: 100,
        lifespan: 300 * size,
        quantity: 10,
        scale: { start: 0.3, end: 0 },
        tintFill: true,
        color: [0x828282, 0xbfbfbf, 0xe8e8e8],
        duration: 100,
      })
      .start();
  };

  const {
    tiled: { tileWidth, tileHeight },
  } = scene;

  // convert coords from bottom left to top left
  const mapCoordTopLeft = {
    x: mapCoord.x,
    y: mapCoord.y + dimensions.height - 1,
  };
  const pixelCoord = tileCoordToPixelCoord(mapCoordTopLeft, tileWidth, tileHeight);

  // throw up dust on build
  flare(
    {
      x: pixelCoord.x + (tileWidth * dimensions.width) / 2,
      y: -pixelCoord.y + (tileHeight * dimensions.height) / 2,
    },
    dimensions.width
  );
};
