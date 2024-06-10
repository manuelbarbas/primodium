import { Entity } from "@latticexyz/recs";
import { EResource } from "contracts/config/enums";
import { Hex } from "viem";
import { distanceBI } from "../global/common";
import { ResourceEntityLookup, SPEED_SCALE, UNIT_SPEED_SCALE } from "@/lib/constants";
import { Tables, Coord } from "@/lib/types";

export function createSendUtils(tables: Tables) {
  function toUnitCountArray(map: Map<Entity, bigint>): bigint[] {
    const prototypes = tables.P_UnitPrototypes.get()?.value ?? [];
    const arr = Array.from({ length: prototypes.length }, () => 0n);
    prototypes.forEach((entity, index) => {
      const count = map.get(entity as Entity);
      if (count) arr[index] = count;
    });
    return arr;
  }

  function toTransportableResourceArray(map: Map<Entity, bigint>): bigint[] {
    const transportables = tables.P_Transportables.get()?.value ?? [];
    const arr = Array.from({ length: transportables.length }, () => 0n);
    transportables.forEach((enumValue, index) => {
      const entity = ResourceEntityLookup[enumValue as EResource];
      const count = map.get(entity as Entity);
      if (!count || count === 0n) return;
      arr[index] = count;
    });
    return arr;
  }

  function getMoveLength(origin: Coord, destination: Coord, playerEntity: Entity, units: Record<Entity, bigint>) {
    const arrivalTime = getArrivalTime(origin, destination, playerEntity, units);
    if (arrivalTime == 0n) return 0;
    const now = tables.Time.get()?.value ?? 0n;
    return Number(arrivalTime - now);
  }
  function getArrivalTime(origin: Coord, destination: Coord, playerEntity: Entity, units: Record<Entity, bigint>) {
    const config = tables.P_GameConfig.get();
    const unitSpeed = getSlowestUnitSpeed(playerEntity, units);
    if (!config) throw new Error("[getMoveLength] No config");

    const time = tables.Time.get()?.value ?? 0n;
    if (unitSpeed == 0n) return 0n;
    return (
      time +
      (distanceBI(origin, destination) * config.travelTime * SPEED_SCALE * UNIT_SPEED_SCALE) /
        (config.worldSpeed * unitSpeed)
    );
  }

  function getSlowestUnitSpeed(playerEntity: Entity, unitCounts: Record<Entity, bigint>) {
    let slowestSpeed = -1n;
    const unitPrototypes = tables.P_UnitPrototypes.get()?.value as Entity[];
    if (unitPrototypes == undefined) throw new Error("[getSlowestUnitSpeed] no UnitPrototypes");

    Object.keys(unitCounts).forEach((rawEntity) => {
      const entity = rawEntity as Entity;
      const unitLevel = tables.UnitLevel.getWithKeys({ entity: playerEntity as Hex, unit: entity as Hex })?.value ?? 0n;
      const speed = tables.P_Unit.getWithKeys({ entity: entity as Hex, level: unitLevel })?.speed ?? 0n;
      if (speed < slowestSpeed || slowestSpeed == -1n) {
        slowestSpeed = speed;
      }
    });
    if (slowestSpeed == -1n) return 0n;
    return slowestSpeed;
  }

  return {
    toUnitCountArray,
    toTransportableResourceArray,
    getMoveLength,
    getArrivalTime,
    getSlowestUnitSpeed,
  };
}
