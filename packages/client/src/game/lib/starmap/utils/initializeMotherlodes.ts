import { Coord } from "@latticexyz/utils";
import { encodeCoord, getMotherlodeEntity, hashKeyEntity } from "src/util/encode";
import { getPositionByVector } from "src/util/vector";
import { world } from "src/network/world";
import { Entity } from "@latticexyz/recs";
import { components } from "src/network/components";
import { EMotherlodeType } from "src/util/web3/types";

export function initializeMotherlodes(sourceEntity: Entity, source: Coord) {
  const config = components.P_GameConfig.get();
  if (!config) throw new Error("GameConfig not found");
  for (let i = 0; i < config.maxMotherlodesPerAsteroid; i++) {
    const motherlodePosition = getPositionByVector(
      Number(config.motherlodeDistance),
      Math.floor((i * 360) / Number(config.maxMotherlodesPerAsteroid)),
      source
    );

    if (components.ReversePosition.getWithKeys(motherlodePosition)) continue;
    const motherlodeEntity = getMotherlodeEntity(sourceEntity, motherlodePosition);
    const encodedPosition = encodeCoord(motherlodePosition);
    world.registerEntity({ id: encodedPosition });
    components.ReversePosition.update({ entity: motherlodeEntity as string }, encodedPosition);

    if (!isMotherlode(motherlodeEntity, Number(config.motherlodeChanceInv))) continue;

    world.registerEntity({ id: motherlodeEntity });
    const { size: rawSize, motherlodeType: rawMotherlodeType } = getMotherlodeRawPrototype(motherlodeEntity);
    const motherlodeType = getMotherlodeType(rawMotherlodeType);
    const size = getSize(rawSize);
    components.Motherlode.update({ size, motherlodeType }, motherlodeEntity);
    components.Position.update({ ...motherlodePosition, parent: "0" }, motherlodeEntity);

    // const resource = components.P_MotherlodeResource.get(hashKeyEntity(motherlodeType, size))?.resource;

    // if (!resource) throw new Error("no resource found for this motherlode type and size");
    // const resourceMotherlodeEntity = hashKeyEntity(resource, motherlodeEntity);
    // world.registerEntity({ id: resourceMotherlodeEntity });
    // components.MotherlodeResource.set({ value: 0 }, resourceMotherlodeEntity);
    components.RockType.set({ value: 2 }, motherlodeEntity);
  }
}

function isMotherlode(entity: Entity, chanceInv: number) {
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
const getByteUInt = (_b: Entity, length: number, shift: number): number => {
  const b = BigInt(_b);
  const mask = ((ONE << BigInt(length)) - ONE) << BigInt(shift);
  const _byteUInt = (b & mask) >> BigInt(shift);
  return Number(_byteUInt);
};

function getMotherlodeRawPrototype(entity: Entity) {
  // 0-31 size
  const size = getByteUInt(entity, 5, 0);
  // 0-31 motherlodeType
  const motherlodeType = getByteUInt(entity, 5, 5);
  // 0-63 blocks to wait
  const cooldownBlocks = getByteUInt(entity, 6, 10);
  return { size, motherlodeType, cooldownBlocks };
}
