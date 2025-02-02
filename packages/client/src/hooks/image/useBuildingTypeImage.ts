import { Entity } from "@primodiumxyz/reactive-tables";
import { useGame } from "@/hooks/useGame";

export const useBuildingTypeImage = (buildingType: Entity) => {
  const game = useGame();
  const { getBuildingSprite: getBuildingImage } = game.ASTEROID.sprite;

  return getBuildingImage(buildingType, 1n);
};
