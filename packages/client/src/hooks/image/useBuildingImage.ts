import { EntityTypetoBuildingSprites } from "@/game/lib/mappings";
import { useGame } from "@/hooks/useGame";
import { clampedIndex } from "@primodiumxyz/core";
import { useCore } from "@primodiumxyz/core/react";
import { Entity } from "@primodiumxyz/reactive-tables";

export const useBuildingImage = (building: Entity) => {
  const { tables } = useCore();
  const game = useGame();

  const buildingType = tables.BuildingType.get(building)?.value as Entity;
  const level = tables.Level.get(building)?.value ?? 1n;
  const { getSpriteBase64 } = game.ASTEROID.sprite;

  if (EntityTypetoBuildingSprites[buildingType]) {
    const imageIndex = parseInt(level ? level.toString() : "1") - 1;

    return getSpriteBase64(
      EntityTypetoBuildingSprites[buildingType][
        clampedIndex(imageIndex, EntityTypetoBuildingSprites[buildingType].length)
      ]
    );
  }

  return "";
};
