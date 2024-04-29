import { Primodium } from "@game/api";
import { Entity } from "@latticexyz/recs";

import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EFleetStance } from "contracts/config/enums";
import { components, components as comps } from "src/network/components";
import { getEntityTypeName } from "./common";
import { EntityType, ResourceStorages, RockRelationship } from "./constants";
import { getFullResourceCount } from "./resource";
import { getOrbitingFleets } from "./unit";
import { MapIdToAsteroidType } from "@/util/mappings";
import { Sprites } from "@primodiumxyz/assets";

//TODO: proper implementation, this is just a placeholder so stuff doesn't break.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAsteroidImage(primodium: Primodium, asteroid: Entity) {
  const { getSpriteBase64 } = primodium.api().sprite;
  return getSpriteBase64(Sprites.Asteroid1);
}

export function getAsteroidName(spaceRock: Entity) {
  const expansionLevel = comps.Level.get(spaceRock)?.value;
  const asteroidData = comps.Asteroid.get(spaceRock);

  const asteroidResource = MapIdToAsteroidType[asteroidData?.mapId ?? 0];
  const asteroidSize = asteroidResource
    ? {
        1: "Micro",
        3: "Small",
        5: "Medium",
        8: "Large",
      }[Number(asteroidData?.maxLevel ?? 1)]
    : "";

  return ` ${expansionLevel ? `LVL. ${expansionLevel} ` : asteroidSize} ${
    asteroidResource ? getEntityTypeName(asteroidResource) : ""
  } ${"Asteroid"}`;
}

export function getAsteroidDescription(asteroid: Entity) {
  const asteroidData = comps.Asteroid.get(asteroid);

  const asteroidResource = MapIdToAsteroidType[asteroidData?.mapId ?? 0];
  const asteroidSize = {
    1: "Micro",
    3: "Small",
    5: "Medium",
    8: "Large",
  }[Number(asteroidData?.maxLevel ?? 1)];

  return {
    type: asteroidResource ? getEntityTypeName(asteroidResource) : "Basic",
    size: asteroidSize,
    primodium: asteroidData?.primodium ?? 0n,
  };
}

export function getAsteroidInfo(primodium: Primodium, spaceRock: Entity) {
  const imageUri = getAsteroidImage(primodium, spaceRock);
  const ownedBy = comps.OwnedBy.get(spaceRock)?.value as Entity | undefined;
  const mainBaseEntity = comps.Home.get(spaceRock)?.value as Entity;
  const mainBaseLevel = comps.Level.get(mainBaseEntity)?.value;
  const asteroidData = comps.Asteroid.get(spaceRock);

  const position = comps.Position.get(spaceRock, {
    x: 0,
    y: 0,
    parentEntity: "0" as Entity,
  });

  const resources = [...ResourceStorages].reduce((acc, resource) => {
    const { resourceCount } = getFullResourceCount(resource, spaceRock);
    const amount = resourceCount;

    if (amount) {
      // only add to the array if amount is non-zero
      acc.push({ id: resource, amount });
    }

    return acc;
  }, [] as { id: Entity; amount: bigint }[]);
  const { resourceCount: encryption } = getFullResourceCount(EntityType.Encryption, spaceRock);

  const hangar = comps.Hangar.get(spaceRock);

  const gracePeriodValue = comps.GracePeriod.get(ownedBy)?.value ?? 0n;
  const now = comps.Time.get()?.value ?? 0n;
  const isInGracePeriod = gracePeriodValue > 0n && gracePeriodValue > now;

  const isBlocked = !!getOrbitingFleets(spaceRock).find(
    (fleet) => components.FleetStance.get(fleet)?.stance == EFleetStance.Block
  );

  return {
    imageUri,
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

export const getRockRelationship = (player: Entity, rock: Entity) => {
  if (player === singletonEntity) return RockRelationship.Neutral;
  const playerAlliance = components.PlayerAlliance.get(player)?.alliance;
  const rockOwner = components.OwnedBy.get(rock)?.value as Entity;
  const rockAlliance = components.PlayerAlliance.get(rockOwner)?.alliance;

  if (player === rockOwner) return RockRelationship.Self;
  if (playerAlliance && playerAlliance === rockAlliance) return RockRelationship.Ally;
  if (rockOwner) return RockRelationship.Enemy;

  return RockRelationship.Neutral;
};
