import { Entity } from "@latticexyz/recs";

import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EFleetStance } from "contracts/config/enums";
import { EntityType, ResourceStorages, RockRelationship } from "@/lib/constants";
import { MapIdToAsteroidType } from "@/lib/mappings";
import { Components, Coord } from "@/lib/types";
import { createResourceUtils } from "@/utils/core/resource";
import { createUnitUtils } from "@/utils/core/unit";
import { getEntityTypeName } from "@/utils/global/common";

export function createAsteroidUtils(components: Components) {
  const { getFullResourceCount } = createResourceUtils(components);
  const { getOrbitingFleets } = createUnitUtils(components);
  function getAsteroidName(spaceRock: Entity) {
    const expansionLevel = components.Level.get(spaceRock)?.value;
    const asteroidData = components.Asteroid.get(spaceRock);

    const asteroidResource = MapIdToAsteroidType[asteroidData?.mapId ?? 0];
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

  function getAsteroidDescription(asteroid: Entity) {
    const asteroidData = components.Asteroid.get(asteroid);

    const asteroidResource = MapIdToAsteroidType[asteroidData?.mapId ?? 0];
    const asteroidSize = {
      1: "Micro",
      3: "Small",
      6: "Medium",
      8: "Large",
    }[Number(asteroidData?.maxLevel ?? 1)];

    return {
      type: asteroidResource ? getEntityTypeName(asteroidResource) : "Common",
      size: asteroidSize,
      primodium: asteroidData?.primodium ?? 0n,
    };
  }

  function getAsteroidInfo(spaceRock: Entity) {
    const ownedBy = components.OwnedBy.get(spaceRock)?.value as Entity | undefined;
    const mainBaseEntity = components.Home.get(spaceRock)?.value as Entity;
    const mainBaseLevel = components.Level.get(mainBaseEntity)?.value;
    const asteroidData = components.Asteroid.get(spaceRock);

    const position = components.Position.get(spaceRock, {
      x: 0,
      y: 0,
      parentEntity: "0" as Entity,
    }) as Coord;

    const resources = [...ResourceStorages].reduce((acc, resource) => {
      const { resourceCount } = getFullResourceCount(resource, spaceRock);
      const amount = resourceCount;

      if (amount) {
        // only add to the array if amount is non-zero
        acc.push({ resource, amount });
      }

      return acc;
    }, [] as { resource: Entity; amount: bigint }[]);
    const { resourceCount: encryption } = getFullResourceCount(EntityType.Encryption, spaceRock);

    const hangar = components.Hangar.get(spaceRock);

    const gracePeriodValue = components.GracePeriod.get(ownedBy)?.value ?? 0n;
    const now = components.Time.get()?.value ?? 0n;
    const isInGracePeriod = gracePeriodValue > 0n && gracePeriodValue > now;

    const isBlocked = !!getOrbitingFleets(spaceRock).find(
      (fleet) => components.FleetStance.get(fleet)?.stance == EFleetStance.Block
    );

    return {
      resources,
      ownedBy,
      mainBaseLevel,
      hangar,
      position,
      name: getAsteroidName(spaceRock),
      entity: spaceRock,
      isInGracePeriod,
      gracePeriodValue,
      asteroidData,
      encryption,
      isBlocked,
    };
  }

  function isAsteroidBlocked(spaceRock: Entity) {
    return !!getOrbitingFleets(spaceRock).find(
      (fleet) => components.FleetStance.get(fleet)?.stance == EFleetStance.Block
    );
  }

  const getRockRelationship = (player: Entity, rock: Entity) => {
    if (player === singletonEntity) return RockRelationship.Neutral;
    const playerAlliance = components.PlayerAlliance.get(player)?.alliance;
    const rockOwner = components.OwnedBy.get(rock)?.value as Entity;
    const rockAlliance = components.PlayerAlliance.get(rockOwner)?.alliance;

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
