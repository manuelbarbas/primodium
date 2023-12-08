import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { components } from "src/network/components";
import { Hex } from "viem";
import { distanceBI } from "./common";
import { SPEED_SCALE, UNIT_SPEED_SCALE, UnitEnumLookup } from "./constants";
import { UnitCountTuple } from "./web3/types";

export function toUnitCountArray(map: Record<Entity, bigint>): UnitCountTuple {
  const arr: UnitCountTuple = [0n, 0n, 0n, 0n, 0n, 0n, 0n];
  Object.entries(map).forEach(([key, value]) => {
    const index = UnitEnumLookup[key as Entity];
    if (index === undefined) throw new Error("Invalid unit entity");
    arr[index - 1] = value;
  });
  return arr;
}

export function getMoveLength(origin: Coord, destination: Coord, playerEntity: Entity, units: Record<Entity, bigint>) {
  const arrivalTime = getArrivalTime(origin, destination, playerEntity, units);
  if (arrivalTime == 0n) return 0;
  const now = components.Time.get()?.value ?? 0n;
  return Number(arrivalTime - now);
}
export function getArrivalTime(origin: Coord, destination: Coord, playerEntity: Entity, units: Record<Entity, bigint>) {
  const config = components.P_GameConfig.get();
  const unitSpeed = getSlowestUnitSpeed(playerEntity, units);
  if (!config) throw new Error("[getMoveLength] No config");

  const time = components.Time.get()?.value ?? 0n;
  if (unitSpeed == 0n) return 0n;
  return (
    time +
    (distanceBI(origin, destination) * config.travelTime * SPEED_SCALE * UNIT_SPEED_SCALE) /
      (config.worldSpeed * unitSpeed)
  );
}

export function getSlowestUnitSpeed(playerEntity: Entity, unitCounts: Record<Entity, bigint>) {
  let slowestSpeed = -1n;
  const unitPrototypes = components.P_UnitPrototypes.get()?.value as Entity[];
  if (unitPrototypes == undefined) throw new Error("[getSlowestUnitSpeed] no UnitPrototypes");

  Object.keys(unitCounts).forEach((rawEntity) => {
    const entity = rawEntity as Entity;
    const unitLevel =
      components.UnitLevel.getWithKeys({ entity: playerEntity as Hex, unit: entity as Hex })?.value ?? 0n;
    const speed = components.P_Unit.getWithKeys({ entity: entity as Hex, level: unitLevel })?.speed ?? 0n;
    if (speed < slowestSpeed || slowestSpeed == -1n) {
      slowestSpeed = speed;
    }
  });
  if (slowestSpeed == -1n) return 0n;
  return slowestSpeed;
}
