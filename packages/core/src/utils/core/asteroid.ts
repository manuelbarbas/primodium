import { Entity } from "@latticexyz/recs";

import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EFleetStance } from "contracts/config/enums";
import { EntityType, ResourceStorages, RockRelationship } from "@/lib/constants";
import { MapEntityLookup } from "@/lib/lookups";
import { Tables, Coord } from "@/lib/types";
import { createResourceUtils } from "@/utils/core/resource";
import { createUnitUtils } from "@/utils/core/unit";
import { getEntityTypeName } from "@/utils/global/common";

export function createAsteroidUtils(tables: Tables) {
  const { getResourceCount } = createResourceUtils(tables);
  const { getOrbitingFleets } = createUnitUtils(tables);

  /**
   * Gets asteroid name from entity
   * @param asteroid  entity of asteroid
   * @returns asteroid name
   */
  function getAsteroidName(asteroid: Entity): string {
    const expansionLevel = tables.Level.get(asteroid)?.value;
    const asteroidData = tables.Asteroid.get(asteroid);

    const asteroidResource = MapEntityLookup[asteroidData?.mapId ?? 0];
    const asteroidSize = asteroidResource
      ? {
          1: "Micro",
          3: "Small",
          6: "Medium",
          8: "Large",
        }[Number(asteroidData?.maxLevel ?? 1)]
      : "";

    return ` ${expansionLevel ? `LVL. ${expansionLevel} ` : asteroidSize} ${
      asteroidResource ? getEntityTypeName(asteroidResource) : ""
    } ${"Asteroid"}`;
  }

  /**
   * Gets asteroid description from entity
   * @param asteroid entity of asteroid
   * @returns asteroid description
   * */
  function getAsteroidDescription(asteroid: Entity): { type: string; size: string; primodium: bigint } {
    const asteroidData = tables.Asteroid.get(asteroid);

    const asteroidResource = MapEntityLookup[asteroidData?.mapId ?? 0];
    const asteroidSize = {
      1: "Micro",
      3: "Small",
      6: "Medium",
      8: "Large",
    }[Number(asteroidData?.maxLevel ?? 1)];

    return {
      type: asteroidResource ? getEntityTypeName(asteroidResource) : "Common",
      size: asteroidSize ?? "Small",
      primodium: asteroidData?.primodium ?? 0n,
    };
  }

  /**
   * Gets asteroid info from entity
   * @param asteroid entity of asteroid
   * @returns asteroid info
   */
  function getAsteroidInfo(asteroid: Entity) {
    const ownedBy = tables.OwnedBy.get(asteroid)?.value as Entity | undefined;
    const mainBaseEntity = tables.Home.get(asteroid)?.value as Entity;
    const mainBaseLevel = tables.Level.get(mainBaseEntity)?.value;
    const asteroidData = tables.Asteroid.get(asteroid);

    const position = tables.Position.get(asteroid, {
      x: 0,
      y: 0,
      parentEntity: "0" as Entity,
    }) as Coord;

    const resources = [...ResourceStorages].reduce((acc, resource) => {
      const { resourceCount } = getResourceCount(resource, asteroid);
      const amount = resourceCount;

      if (amount) {
        // only add to the array if amount is non-zero
        acc.push({ resource, amount });
      }

      return acc;
    }, [] as { resource: Entity; amount: bigint }[]);
    const { resourceCount: encryption } = getResourceCount(EntityType.Encryption, asteroid);

    const hangar = tables.Hangar.get(asteroid);

    const gracePeriodValue = tables.GracePeriod.get(ownedBy)?.value ?? 0n;
    const now = tables.Time.get()?.value ?? 0n;
    const isInGracePeriod = gracePeriodValue > 0n && gracePeriodValue > now;

    const isBlocked = !!getOrbitingFleets(asteroid).find(
      (fleet) => tables.FleetStance.get(fleet)?.stance == EFleetStance.Block
    );

    return {
      resources,
      ownedBy,
      mainBaseLevel,
      hangar,
      position,
      name: getAsteroidName(asteroid),
      entity: asteroid,
      isInGracePeriod,
      gracePeriodValue,
      asteroidData,
      encryption,
      isBlocked,
    };
  }

  /**
   * Gets whether asteroid is blocked
   * @param asteroid  entity of asteroid
   */
  function isAsteroidBlocked(asteroid: Entity): boolean {
    return !!getOrbitingFleets(asteroid).find((fleet) => tables.FleetStance.get(fleet)?.stance == EFleetStance.Block);
  }

  /**
   * Gets the relationship between a player and a rock
   * @param player Player entity
   * @param rock Rock entity
   * @returns Relationship
   */
  const getRockRelationship = (player: Entity, rock: Entity): keyof typeof RockRelationship => {
    if (player === singletonEntity) return RockRelationship.Neutral;
    const playerAlliance = tables.PlayerAlliance.get(player)?.alliance;
    const rockOwner = tables.OwnedBy.get(rock)?.value as Entity;
    const rockAlliance = tables.PlayerAlliance.get(rockOwner)?.alliance;

    if (player === rockOwner) return RockRelationship.Self;
    if (playerAlliance && playerAlliance === rockAlliance) return RockRelationship.Ally;
    if (rockOwner) return RockRelationship.Enemy;

    return RockRelationship.Neutral;
  };

  return {
    getAsteroidName,
    getAsteroidDescription,
    getAsteroidInfo,
    isAsteroidBlocked,
    getRockRelationship,
  };
}
