import { Entity } from "@primodiumxyz/reactive-tables";
import { useMemo } from "react";
import { useCore } from "@/react/hooks/useCore";
import { EntityType } from "@/lib/constants";
import { Hex } from "viem";
import { useResourceCount } from "./useResourceCount";

/**
 * Calculates the strength and maximum strength of an asteroid.
 *
 * @param asteroid - The asteroid entity.
 * @param force - Optional parameter to force recalculation of the strength.
 * @returns An object containing the strength and maximum strength of the asteroid.
 */
export const useAsteroidStrength = (asteroid: Entity, force = false) => {
  const { tables } = useCore();
  const { resourceCount: hp, resourceStorage: maxHp } = useResourceCount(EntityType.HP, asteroid);
  const { resourceCount: baseDefense } = useResourceCount(EntityType.Defense, asteroid);
  const { resourceCount: defenseMultiplier } = useResourceCount(EntityType.DefenseMultiplier, asteroid);
  const hangar = tables.Hangar.use(asteroid);
  return useMemo(() => {
    const unitDefense =
      hangar?.units.reduce((acc, unit, i) => {
        const count = hangar?.counts[i] ?? 0n;
        if (count == 0n) return acc;
        const unitLevel = tables.UnitLevel.getWithKeys({ entity: asteroid as Hex, unit: unit as Hex })?.value ?? 0n;
        const defense = tables.P_Unit.getWithKeys({ entity: unit as Hex, level: unitLevel })?.defense ?? 0n;
        return acc + count * defense;
      }, 0n) ?? 0n;

    const absDefense = ((baseDefense + unitDefense) * (100n + defenseMultiplier)) / 100n;
    const finalDefense = maxHp > 0 ? (absDefense * hp) / maxHp : absDefense;

    return { strength: finalDefense, maxStrength: absDefense };
  }, [hangar, baseDefense, defenseMultiplier, maxHp, hp, asteroid, force]);
};
