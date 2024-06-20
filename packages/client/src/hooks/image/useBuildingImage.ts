import { useGame } from "@/hooks/useGame";
import { useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";

export const useBuildingImage = (building: Entity) => {
  const { tables } = useCore();
  const game = useGame();

  const buildingType = tables.BuildingType.get(building)?.value as Entity;
  const level = tables.Level.get(building)?.value ?? 1n;
  const { getBuildingSprite: getBuildingImage } = game.ASTEROID.sprite;

  return getBuildingImage(buildingType, level);
};
