import { Primodium } from "@game/api";
import { Entity } from "@latticexyz/recs";

import { Assets } from "@game/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { EFleetStance } from "contracts/config/enums";
import { getRockSprite } from "src/game/lib/starmap/systems/utils/getSprites";
import { components, components as comps } from "src/network/components";
import { Hangar } from "src/network/components/clientComponents";
import { getBlockTypeName } from "./common";
import { MapIdToAsteroidType, PIRATE_KEY, ResourceStorages, RockRelationship } from "./constants";
import { hashKeyEntity } from "./encode";
import { getFullResourceCount } from "./resource";
import { getOrbitingFleets } from "./unit";

export function getAsteroidImage(primodium: Primodium, asteroid: Entity) {
  const { getSpriteBase64 } = primodium.api().sprite;
  const asteroidData = comps.Asteroid.get(asteroid);
  const mainBaseEntity = comps.Home.get(asteroid)?.value as Entity;
  const mainBaseLevel = comps.Level.get(mainBaseEntity, {
    value: 1n,
  }).value;

  if (!asteroidData) {
    console.error("Asteroid data not found for: " + asteroid);
    return undefined;
  }

  if (components.PirateAsteroid.has(asteroid)) return getSpriteBase64(getRockSprite(1, 1n), Assets.SpriteAtlas);
  const spriteKey = getRockSprite(asteroidData.mapId, asteroidData.mapId === 1 ? mainBaseLevel : asteroidData.maxLevel);

  return getSpriteBase64(spriteKey, Assets.SpriteAtlas);
}

export function getSpaceRockName(spaceRock: Entity) {
  const mainBaseEntity = comps.Home.get(spaceRock)?.value as Entity;
  const mainBaseLevel = comps.Level.get(mainBaseEntity)?.value;
  const isPirate = !!comps.PirateAsteroid.get(spaceRock);
  const asteroidData = comps.Asteroid.get(spaceRock);

  const asteroidResource = MapIdToAsteroidType[asteroidData?.mapId ?? 0];
  const asteroidSize = asteroidResource
    ? {
        1: "Micro",
        2: "Small",
        3: "Medium",
        4: "Large",
      }[Number(asteroidData?.maxLevel ?? 1)]
    : "";

  return ` ${mainBaseLevel ? `LVL. ${mainBaseLevel} ` : asteroidSize} ${
    asteroidResource ? getBlockTypeName(asteroidResource) : ""
  } ${isPirate ? "Pirate" : "Asteroid"}`;
}

export function getSpaceRockInfo(primodium: Primodium, spaceRock: Entity) {
  const imageUri = getAsteroidImage(primodium, spaceRock);
  const ownedBy = comps.OwnedBy.get(spaceRock)?.value as Entity | undefined;
  const mainBaseEntity = comps.Home.get(spaceRock)?.value as Entity;
  const mainBaseLevel = comps.Level.get(mainBaseEntity)?.value;

  const position = comps.Position.get(spaceRock, {
    x: 0,
    y: 0,
    parent: "0" as Entity,
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

  const hangar = Hangar.get(spaceRock);

  const gracePeriodValue = comps.GracePeriod.get(ownedBy)?.value ?? 0n;
  const now = comps.Time.get()?.value ?? 0n;
  const isInGracePeriod = gracePeriodValue > 0n && gracePeriodValue > now;

  let name = "";
  const player = comps.Account.get()?.value;
  const hash = player ? hashKeyEntity(PIRATE_KEY, player) : undefined;
  name = `${hash === ownedBy ? "Pirate" : "Player"} Asteroid`;

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
    name,
    entity: spaceRock,
    isInGracePeriod,
    gracePeriodValue,
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
