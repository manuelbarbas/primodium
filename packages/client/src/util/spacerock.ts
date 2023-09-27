import { EntityID } from "@latticexyz/recs";
import { ESpaceRockType } from "./web3/types";
import {
  AsteroidType,
  IsMineableAt,
  LastClaimedAt,
  Level,
  MainBase,
  Motherlode,
  MotherlodeResource,
  OwnedBy,
  P_WorldSpeed,
  Pirate,
  Position,
} from "src/network/components/chainComponents";
import {
  BlockType,
  MotherlodeSizeNames,
  MotherlodeTypeNames,
  ResourceStorages,
  ResourceType,
  SPEED_SCALE,
} from "./constants";
import { clampedIndex, getBlockTypeName } from "./common";
import { Assets, EntityIDtoSpriteKey, SpriteKeys } from "@game/constants";
import { SingletonID } from "@latticexyz/network";
import { primodium } from "@game/api";
import { getFullResourceCount, getMotherlodeResource } from "./resource";
import { BlockNumber, Hangar } from "src/network/components/clientComponents";
import { getUnitStats } from "./trainUnits";

function getSpaceRockImage(spaceRock: EntityID, type: ESpaceRockType) {
  const { getSpriteBase64 } = primodium.api().sprite;

  if (type === ESpaceRockType.Asteroid) {
    const pirate = Pirate.get(spaceRock);

    if (pirate)
      return getSpriteBase64(SpriteKeys.PirateAsteroid1, Assets.SpriteAtlas);

    const ownedBy = OwnedBy.get(spaceRock, {
      value: SingletonID,
    }).value;

    const mainBaseEntity = MainBase.get(ownedBy, {
      value: "-1" as EntityID,
    }).value;

    const mainBaseLevel = Level.get(mainBaseEntity, {
      value: 1,
    }).value;

    const spriteKey =
      EntityIDtoSpriteKey[BlockType.Asteroid][
        clampedIndex(
          mainBaseLevel - 1,
          EntityIDtoSpriteKey[BlockType.Asteroid].length
        )
      ];

    return getSpriteBase64(spriteKey, Assets.SpriteAtlas);
  }

  if (type === ESpaceRockType.Motherlode) {
    const motherlodeData = Motherlode.get(spaceRock);
    if (!motherlodeData) return "";

    const spriteKey =
      SpriteKeys[
        `Motherlode${MotherlodeTypeNames[motherlodeData.motherlodeType]}${
          MotherlodeSizeNames[motherlodeData.size]
        }` as keyof typeof SpriteKeys
      ];

    return getSpriteBase64(spriteKey, Assets.SpriteAtlas);
  }

  return "";
}

export function getSpaceRockInfo(spaceRock: EntityID) {
  const type = AsteroidType.get(spaceRock, { value: ESpaceRockType.Asteroid })
    .value as ESpaceRockType;
  const { value: blockNumber } = BlockNumber.get(undefined, {
    value: 0,
    avgBlockTime: 1,
  });

  const imageUri = getSpaceRockImage(spaceRock, type);

  const motherlodeData = Motherlode.get(spaceRock);

  const ownedBy = OwnedBy.get(spaceRock)?.value;
  const mainBaseEntity = MainBase.get(ownedBy, {
    value: "-1" as EntityID,
  }).value;
  const mainBaseLevel = Level.get(mainBaseEntity)?.value;

  const position = Position.get(spaceRock, {
    x: 0,
    y: 0,
    parent: "0" as EntityID,
  });

  const resources = ownedBy
    ? ResourceStorages.map((resource) => {
        const { resourceCount, resourcesToClaim } = getFullResourceCount(
          resource,
          ResourceType.Resource,
          ownedBy
        );

        const amount = resourceCount + resourcesToClaim;

        return {
          id: resource,
          amount,
        };
      }).filter((resource) => resource.amount)
    : [];

  const motherlodeResource = getMotherlodeResource(spaceRock);

  const hangar = Hangar.get(spaceRock);

  const mineableAt = Number(IsMineableAt.get(spaceRock, { value: "0" }).value);

  const resourceMined = MotherlodeResource.get(spaceRock, { value: 0 }).value;

  let production = 0;
  if (hangar && motherlodeResource) {
    const worldSpeed = P_WorldSpeed.get()?.value ?? SPEED_SCALE;
    const lastClaimedAt = LastClaimedAt.get(spaceRock)?.value ?? 0;
    for (let i = 0; i < hangar.units.length; i++) {
      production += getUnitStats(hangar.units[i]).MIN * hangar.counts[i];
    }

    production *= ((blockNumber - lastClaimedAt) * SPEED_SCALE) / worldSpeed;
    if (production + resourceMined > motherlodeResource.maxAmount)
      production = motherlodeResource.maxAmount - resourceMined;
  }

  let name = "";
  switch (type) {
    case ESpaceRockType.Motherlode:
      name = `${
        MotherlodeSizeNames[motherlodeData?.size ?? 0]
      } ${getBlockTypeName(motherlodeResource?.resource)} Motherlode`;
      break;
    case ESpaceRockType.Asteroid:
      name = Pirate.get(spaceRock) ? "Pirate Asteroid" : "Player Asteroid";
      break;
    default:
      name = "Unknown Spacerock";
      break;
  }

  return {
    type,
    imageUri,
    motherlodeData: {
      ...motherlodeData,
      ...motherlodeResource,
      mineableAt,
      blocksLeft: mineableAt - blockNumber,
      resourceLeft: motherlodeResource
        ? motherlodeResource.maxAmount - (resourceMined + production)
        : 0,
    },
    resources,
    ownedBy,
    mainBaseLevel,
    hangar,
    position,
    name,
    entity: spaceRock,
  };
}
