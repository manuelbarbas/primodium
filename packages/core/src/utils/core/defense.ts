import { EResource } from "contracts/config/enums"; // Assuming EResource is imported this way
import { Hex } from "viem";

import { Entity } from "@primodiumxyz/reactive-tables";
import { MULTIPLIER_SCALE } from "@/lib/constants";
import { Tables } from "@/lib/types";

export function createDefenseUtils(tables: Tables) {
  /** Get defense points and multiplier for a rock */
  function getRockDefense(rockEntity: Entity) {
    const player = tables.OwnedBy.get(rockEntity)?.value as Hex | undefined;
    const units = tables.Hangar.get(rockEntity);
    if (!player || !units) return { points: 0n, multiplier: MULTIPLIER_SCALE };

    let defensePoints = 0n;

    units.units.forEach((unit, i) => {
      const count = units.counts[i];
      const level = tables.UnitLevel.getWithKeys({ entity: player, unit: unit as Hex })?.value ?? 0n;
      const unitInfo = tables.P_Unit.getWithKeys({ entity: unit as Hex, level });
      if (unitInfo) {
        defensePoints += count * unitInfo.defense;
      }
    });

    let multiplier = MULTIPLIER_SCALE;
    if (tables.Home.get(player as Entity)?.value === rockEntity) {
      const rawMultiplier = tables.ResourceCount.getWithKeys({
        entity: rockEntity as Hex,
        resource: EResource.M_DefenseMultiplier,
      })?.value;

      multiplier = (rawMultiplier ?? 0n) + 100n;

      defensePoints +=
        tables.ResourceCount.getWithKeys({ entity: rockEntity as Hex, resource: EResource.U_Defense })?.value ?? 0n;
      defensePoints = (defensePoints * multiplier) / MULTIPLIER_SCALE;
    }

    return { points: defensePoints, multiplier };
  }

  /** Gets if entity is in grace period */
  const getInGracePeriod = (entity: Entity) => {
    const time = tables.Time.get()?.value ?? 0n;
    const endTime = tables.GracePeriod.get(entity)?.value ?? 0n;
    const inGracePeriod = time < endTime;
    if (!inGracePeriod) return { inGracePeriod: false, duration: 0 };
    return { inGracePeriod, duration: endTime - time };
  };

  /** Gets if entity is in cooldown end */
  const getInCooldownEnd = (entity: Entity) => {
    const time = tables.Time.get()?.value ?? 0n;
    const endTime = tables.CooldownEnd.get(entity)?.value ?? 0n;
    const inCooldown = time < endTime;
    if (!inCooldown) return { inCooldown: false, duration: 0 };
    return { inCooldown, duration: endTime - time };
  };

  return {
    getRockDefense,
    getInGracePeriod,
    getInCooldownEnd,
  };
}
