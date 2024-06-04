import { Entity } from "@latticexyz/recs";
import { bigIntMin } from "@latticexyz/common/utils";
import { components as comps } from "src/network/components";
import { Hex } from "viem";
import { EntityType, SPEED_SCALE, RESOURCE_SCALE } from "./constants";

export function getAsteroidDroidCount(asteroid: Entity): bigint {
  const homeHex = asteroid as Hex;

  const owner = comps.OwnedBy.getWithKeys({ entity: homeHex })?.value as Entity | undefined;
  if (owner != undefined) return 0n;

  const time = comps.Time.get()?.value ?? 0n;

  const playerLastClaimed = comps.DroidRegenTimestamp.getWithKeys({ entity: homeHex })?.value ?? 0n;
  const timeSinceClaimed =
    ((time - playerLastClaimed) * (comps.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;

  const maxLevel = comps.Asteroid.getWithKeys({ entity: homeHex })?.maxLevel ?? 0n;

  const maxDroidCount = getSecondaryAsteroidUnitsAndEncryption(asteroid, maxLevel).droidCount;

  const droidCount = comps.UnitCount.getWithKeys({ entity: homeHex, unit: EntityType.Droid as Hex })?.value ?? 0n;

  const droidRegenRate = comps.P_Unit.getWithKeys({ entity: EntityType.Droid as Hex, level: 0n })?.trainingTime ?? 0n;
  const totalDroidCount = droidCount + timeSinceClaimed / droidRegenRate;

  return bigIntMin(totalDroidCount, maxDroidCount);
}

function getSecondaryAsteroidUnitsAndEncryption(asteroidEntity: Entity, level: bigint) {
  // this is a crime but wanted to preserve the const without using an implicit equation.
  const droidCount = level < 3n ? 5n : level < 6n ? 80n : level < 8n ? 1280n : 20480n;
  const encryption = (level * 300n + 300n) * RESOURCE_SCALE;
  return { droidCount, encryption };
}
