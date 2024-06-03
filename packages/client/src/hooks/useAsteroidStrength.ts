import { Entity } from "@latticexyz/recs";
import { useMemo } from "react";
import { components } from "src/network/components";
import { EntityType } from "src/util/constants";
import { Hex } from "viem";
import { useFullResourceCount } from "./useFullResourceCount";

export const useAsteroidStrength = (asteroid: Entity, force = false) => {
  const { resourceCount: hp, resourceStorage: maxHp } = useFullResourceCount(EntityType.HP, asteroid);
  const { resourceCount: baseDefense } = useFullResourceCount(EntityType.Defense, asteroid);
  const { resourceCount: defenseMultiplier } = useFullResourceCount(EntityType.DefenseMultiplier, asteroid);
  const hangar = components.Hangar.use(asteroid);
  return useMemo(() => {
    const unitDefense =
      hangar?.units.reduce((acc, unit, i) => {
        const count = hangar?.counts[i] ?? 0n;
        if (count == 0n) return acc;
        const unitLevel = components.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: unit as Hex })?.value ?? 0n;
        const defense = components.P_Unit.getWithKeys({ entity: unit as Hex, level: unitLevel })?.defense ?? 0n;
        return acc + count * defense;
      }, 0n) ?? 0n;

    const absDefense = ((baseDefense + unitDefense) * (100n + defenseMultiplier)) / 100n;
    const finalDefense = maxHp > 0 ? (absDefense * hp) / maxHp : absDefense;

    return { strength: finalDefense, maxStrength: absDefense };
  }, [hangar, baseDefense, defenseMultiplier, maxHp, hp, asteroid, force]);
};
