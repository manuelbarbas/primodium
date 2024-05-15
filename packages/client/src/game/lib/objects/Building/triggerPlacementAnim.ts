import { Entity } from "@latticexyz/recs";
import { components } from "@/network/components";
import { PrimodiumScene } from "@/game/api/scene";
import { tileCoordToPixelCoord } from "engine/lib/util/coords";
import { Coord } from "engine/types";
import { getBuildingDimensions } from "@/util/building";

export const triggerPlacementAnim = (scene: PrimodiumScene, entity: Entity, mapCoord: Coord) => {
  const flare = (absoluteCoord: Coord, size = 1) => {
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
  const buildingType = components.BuildingType.get(entity)?.value as Entity | undefined;
  if (!buildingType) return;

  const buildingDimensions = getBuildingDimensions(buildingType);
  // convert coords from bottom left to top left
  const mapCoordTopLeft = {
    x: mapCoord.x,
    y: mapCoord.y + buildingDimensions.height - 1,
  };
  const pixelCoord = tileCoordToPixelCoord(mapCoordTopLeft, tileWidth, tileHeight);

  // throw up dust on build
  flare(
    {
      x: pixelCoord.x + (tileWidth * buildingDimensions.width) / 2,
      y: -pixelCoord.y + (tileHeight * buildingDimensions.height) / 2,
    },
    buildingDimensions.width
  );
};
