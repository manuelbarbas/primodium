import { Entity } from "@latticexyz/recs";
import { EMap } from "contracts/config/enums";
import { components as comps } from "src/network/components";
import { Hex } from "viem";
import { EntityType, SPEED_SCALE, RESOURCE_SCALE } from "./constants";

export function getAsteroidDroidCount(asteroid: Entity): Map<Entity, bigint> {
  const homeHex = asteroid as Hex;

  const mapId = comps.Asteroid.getWithKeys({ entity: homeHex })?.mapId ?? 0n;
  const owner = (comps.OwnedBy.getWithKeys({ entity: homeHex })?.value ?? 0n) as Entity | undefined;
  console.log("owner: ", owner);
  if (mapId != EMap.Common || owner != undefined) {
    return new Map<Entity, bigint>();
  }

  const time = comps.Time.get()?.value ?? 0n;

  const playerLastClaimed = comps.DroidRegenTimestamp.getWithKeys({ entity: homeHex })?.value ?? 0n;
  const timeSinceClaimed =
    ((time - playerLastClaimed) * (comps.P_GameConfig?.get()?.worldSpeed ?? SPEED_SCALE)) / SPEED_SCALE;

  const maxLevel = comps.Asteroid.getWithKeys({ entity: homeHex })?.maxLevel ?? 0n;

  const maxDroidCount = getSecondaryAsteroidUnitsAndEncryption(asteroid, maxLevel).droidCount;

  const droidCount = comps.UnitCount.getWithKeys({ entity: homeHex, unit: EntityType.Droid as Hex })?.value ?? 0n;

  const droidRegenRate = comps.P_Unit.getWithKeys({ entity: EntityType.Droid as Hex, level: 0n })?.trainingTime ?? 0n;
  let totalDroidCount = droidCount + droidRegenRate * timeSinceClaimed;
  if (totalDroidCount >= maxDroidCount) {
    totalDroidCount = maxDroidCount;
  }

  const result = new Map<Entity, bigint>();
  result.set(EntityType.Droid, totalDroidCount);
  return result;
}

function getSecondaryAsteroidUnitsAndEncryption(asteroidEntity: Entity, level: bigint) {
  const droidCount = 4n ** level + 100n;
  const encryption = (level * 10n + 10n) * RESOURCE_SCALE;
  return { droidCount, encryption };
}
