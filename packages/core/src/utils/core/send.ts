import { EResource } from "contracts/config/enums";
import { Hex } from "viem";

import { Entity } from "@primodiumxyz/reactive-tables";
import { ResourceEntityLookup, SPEED_SCALE, UNIT_SPEED_SCALE } from "@/lib";
import { Coord, Tables } from "@/lib/types";
import { distanceBI } from "@/utils/global/common";

export function createSendUtils(tables: Tables) {
  /**
   * Converts a map of entities to counts to a contract call-friendly array of unit counts
   *
   * @param map A map of entities to counts
   * @returns A contract call-friendly array of unit counts
   */
  function toUnitCountArray(map: Map<Entity, bigint>): bigint[] {
    const prototypes = tables.P_UnitPrototypes.get()?.value ?? [];
    const arr = Array.from({ length: prototypes.length }, () => 0n);
    prototypes.forEach((entity, index) => {
      const count = map.get(entity as Entity);
      if (count) arr[index] = count;
    });
    return arr;
  }

  /**
   * Converts a map of entities to counts to a contract call-friendly array of resource counts
   *
   * @param map A map of entities to counts
   * @returns A contract call-friendly array of resource counts
   */
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

  /**
   * Gets the length of a move in seconds
   *
   * @param origin The origin coordinate of the move
   * @param destination The destination coordinate of the move
   * @param playerEntity The player entity
   * @param units A map of unit entities to counts
   */
  function getMoveLength(
    origin: Coord,
    destination: Coord,
    playerEntity: Entity,
    units: Record<Entity, bigint>,
  ): number {
    const arrivalTime = getArrivalTime(origin, destination, playerEntity, units);
    if (arrivalTime == 0n) return 0;
    const now = tables.Time.get()?.value ?? 0n;
    return Number(arrivalTime - now);
  }

  /**
   * Gets the arrival time of a move
   *
   * @param origin The origin coordinate of the move
   * @param destination The destination coordinate of the move
   * @param playerEntity The player entity
   * @param units A map of unit entities to counts
   */
  function getArrivalTime(
    origin: Coord,
    destination: Coord,
    playerEntity: Entity,
    units: Record<Entity, bigint>,
  ): bigint {
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

  /**
   * Gets the slowest unit speed in a map of unit entities to counts
   *
   * @param playerEntity The player entity
   * @param unitCounts A map of unit entities to counts
   */
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
