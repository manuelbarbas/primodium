import { Hex } from "viem";

import { Entity } from "@primodiumxyz/reactive-tables";
import { EntityType } from "@/lib/constants";
import { Tables } from "@/lib/types";
import { createRecipeUtils } from "@/utils/core/recipe";
import { getEntityTypeName } from "@/utils/global/common";

export function createUpgradeUtils(tables: Tables) {
  const { getRecipe } = createRecipeUtils(tables);

  /**
   * Gets upgrade info for a given research (building or unit upgrade) on a given asteroid
   *
   * @param research Upgrade entity
   * @param asteroid
   * @returns Upgrade info
   */
  function getUpgradeInfo(research: Entity, asteroid: Entity) {
    const level =
      research === EntityType.Expansion
        ? (tables.Level.get(asteroid as Entity)?.value ?? 1n)
        : (tables.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: research as Hex })?.value ?? 0n);
    let nextLevel = level + 1n;

    const maxLevel =
      (research === EntityType.Expansion
        ? tables.Asteroid.getWithKeys({ entity: asteroid as Hex })?.maxLevel
        : tables.P_MaxLevel.getWithKeys({ prototype: research as Hex })?.value) ?? 0n;

    nextLevel = nextLevel > maxLevel ? maxLevel : nextLevel;

    const recipe = getRecipe(research, nextLevel, true);

    const isResearched = level >= maxLevel;

    const mainBaseLvlReq =
      tables.P_RequiredBaseLevel.getWithKeys({ level: nextLevel, prototype: research as Hex })?.value ?? 1n;

    return {
      maxLevel,
      level,
      name: getEntityTypeName(research),
      mainBaseLvlReq,
      isResearched,
      recipe,
    };
  }

  return {
    getUpgradeInfo,
  };
}
