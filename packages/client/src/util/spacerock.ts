import { Primodium } from "@game/api";
import { Entity } from "@latticexyz/recs";

import { Assets, EntitytoSpriteKey } from "@game/constants";
import { singletonEntity } from "@latticexyz/store-sync/recs";
import { components, components as comps } from "src/network/components";
import { Hangar } from "src/network/components/clientComponents";
import { clampedIndex } from "./common";
import { EntityType, PIRATE_KEY, ResourceStorages, RockRelationship } from "./constants";
import { hashKeyEntity } from "./encode";
import { getFullResourceCount } from "./resource";

export function getSpaceRockImage(primodium: Primodium, spaceRock: Entity) {
  const { getSpriteBase64 } = primodium.api().sprite;

  const mainBaseEntity = comps.Home.get(spaceRock)?.value as Entity;

  const mainBaseLevel = comps.Level.get(mainBaseEntity, {
    value: 1n,
  }).value;

  const spriteKey =
    EntitytoSpriteKey[EntityType.Asteroid][
      clampedIndex(Number(mainBaseLevel - 1n), EntitytoSpriteKey[EntityType.Asteroid].length)
    ];

  return getSpriteBase64(spriteKey, Assets.SpriteAtlas);
}

export function getSpaceRockName(spaceRock: Entity) {
  const player = comps.Account.get()?.value;
  const home = comps.Home.get(player)?.value as Entity | undefined;
  if (home === spaceRock) return "Home Asteroid";

  const mainBaseEntity = comps.Home.get(spaceRock)?.value as Entity;
  const mainBaseLevel = comps.Level.get(mainBaseEntity)?.value;
  const isPirate = !!comps.PirateAsteroid.get(spaceRock);

  return ` ${mainBaseLevel ? `LVL. ${mainBaseLevel} ` : ""} ${isPirate ? "Pirate" : "Asteroid"}`;
}

export function getSpaceRockInfo(primodium: Primodium, spaceRock: Entity) {
  const imageUri = getSpaceRockImage(primodium, spaceRock);

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
