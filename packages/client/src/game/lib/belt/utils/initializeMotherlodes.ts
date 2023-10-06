import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import {
  AsteroidType,
  GameConfig,
  Motherlode,
  MotherlodeResource,
  P_MotherlodeResource,
  Position,
  ReversePosition,
} from "src/network/components/chainComponents";
import { world } from "src/network/world";
import { encodeCoord, getMotherlodeEntity, hashKeyEntity } from "src/util/encode";
import { getPositionByVector } from "src/util/vector";
import { EMotherlodeSize, EMotherlodeType, ESpaceRockType } from "src/util/web3/types";

export function initializeMotherlodes(sourceEntity: EntityID, source: Coord) {
  const config = GameConfig.get();
  if (!config) throw new Error("GameConfig not found");
  for (let i = 0; i < config.maxMotherlodesPerAsteroid; i++) {
    const motherlodePosition = getPositionByVector(
      config.motherlodeDistance,
      Math.floor((i * 360) / config.maxMotherlodesPerAsteroid),
      source
    );
    if (ReversePosition.has(encodeCoord(motherlodePosition))) continue;
    const motherlodeEntity = getMotherlodeEntity(sourceEntity, motherlodePosition);
    const encodedPosition = encodeCoord(motherlodePosition);
    world.registerEntity({ id: encodedPosition });
    ReversePosition.set({ value: motherlodeEntity }, encodedPosition);

    if (!isMotherlode(motherlodeEntity, config.motherlodeChanceInv)) continue;

    world.registerEntity({ id: motherlodeEntity });
    const {
      size: rawSize,
      motherlodeType: rawMotherlodeType,
      cooldownBlocks,
    } = getMotherlodeRawPrototype(motherlodeEntity);
    const motherlodeType = getMotherlodeType(rawMotherlodeType);
    const size = getSize(rawSize);
    Motherlode.set({ size, motherlodeType, cooldownBlocks: cooldownBlocks.toString() }, motherlodeEntity);
    Position.set({ ...motherlodePosition, parent: "0" as EntityID }, motherlodeEntity);

    const resource = P_MotherlodeResource.get(hashKeyEntity(motherlodeType, size))?.resource;

    if (!resource) throw new Error("no resource found for this motherlode type and size");
    const resourceMotherlodeEntity = hashKeyEntity(resource, motherlodeEntity);
    world.registerEntity({ id: resourceMotherlodeEntity });
    MotherlodeResource.set({ value: 0 }, resourceMotherlodeEntity);
    AsteroidType.set({ value: ESpaceRockType.Motherlode }, motherlodeEntity);
  }
}

function isMotherlode(entity: EntityID, chanceInv: number) {
  const motherlodeType = getByteUInt(entity, 6, 128);
  return motherlodeType % chanceInv === 1;
}

function getSize(size: number) {
  if (size <= 16) return EMotherlodeSize.SMALL;
  if (size <= 26) return EMotherlodeSize.MEDIUM;
  return EMotherlodeSize.LARGE;
}

function getMotherlodeType(motherlodeType: number) {
  if (motherlodeType <= 11) return EMotherlodeType.TITANIUM;
  if (motherlodeType < 21) return EMotherlodeType.IRIDIUM;
  if (motherlodeType < 27) return EMotherlodeType.PLATINUM;
  return EMotherlodeType.KIMBERLITE;
}

const ONE = BigInt(1);
const getByteUInt = (_b: EntityID, length: number, shift: number): number => {
  const b = BigInt(_b);
  const mask = ((ONE << BigInt(length)) - ONE) << BigInt(shift);
  const _byteUInt = (b & mask) >> BigInt(shift);
  return Number(_byteUInt);
};

function getMotherlodeRawPrototype(entity: EntityID) {
  // 0-31 size
  const size = getByteUInt(entity, 5, 0);
  // 0-31 motherlodeType
  const motherlodeType = getByteUInt(entity, 5, 5);
  // 0-63 blocks to wait
  const cooldownBlocks = getByteUInt(entity, 6, 10);
  return { size, motherlodeType, cooldownBlocks };
}
