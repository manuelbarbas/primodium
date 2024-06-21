import { Entity } from "@primodiumxyz/reactive-tables";
import { bigIntMin } from "@latticexyz/common/utils";
import { Hex } from "viem";
import { EntityType, SPEED_SCALE, RESOURCE_SCALE } from "@/lib/constants";
import { Tables } from "@/lib/types";

export function createDroidRegenUtils(tables: Tables) {
  /**
   * Gets the droid count for an asteroid
   */
  function getAsteroidDroidCount(asteroid: Entity): bigint {
    const homeHex = asteroid as Hex;

    const owner = tables.OwnedBy.getWithKeys({ entity: homeHex })?.value as Entity | undefined;
    if (owner != undefined) return 0n;

    const time = tables.Time.get()?.value ?? 0n;

    const playerLastClaimed = tables.DroidRegenTimestamp.getWithKeys({ entity: homeHex })?.value ?? 0n;
    const timeSinceClaimed =
      ((time - playerLastClaimed) * (tables.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;

    const maxLevel = tables.Asteroid.getWithKeys({ entity: homeHex })?.maxLevel ?? 0n;

    const maxDroidCount = getSecondaryAsteroidUnitsAndEncryption(maxLevel).droidCount;

    const droidCount = tables.UnitCount.getWithKeys({ entity: homeHex, unit: EntityType.Droid as Hex })?.value ?? 0n;

    const droidRegenRate =
      tables.P_Unit.getWithKeys({ entity: EntityType.Droid as Hex, level: 0n })?.trainingTime ?? 1n;
    const totalDroidCount = droidCount + timeSinceClaimed / droidRegenRate;

    return bigIntMin(totalDroidCount, maxDroidCount);
  }
  /**
   * Gets the droid count and encryption of an asteroid
   */
  function getSecondaryAsteroidUnitsAndEncryption(level: bigint) {
    // this is a crime but wanted to preserve the const without using an implicit equation.
    const droidCount = level < 3n ? 5n : level < 6n ? 80n : level < 8n ? 1280n : 20480n;
    const encryption = (level * 300n + 300n) * RESOURCE_SCALE;
    return { droidCount, encryption };
  }

  return {
    getAsteroidDroidCount,
  };
}
