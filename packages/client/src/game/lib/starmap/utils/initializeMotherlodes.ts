import { Entity } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { EResource, ERock, ESize } from "contracts/config/enums";
import { components } from "src/network/components";
import { world } from "src/network/world";
import { getMotherlodeEntity, toHex32 } from "src/util/encode";
import { getPositionByVector } from "src/util/vector";
import { Hex } from "viem";

const emptyData = {
  __staticData: "",
  __encodedLengths: "",
  __dynamicData: "",
};

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
    world.registerEntity({ id: motherlodeEntity });
    components.ReversePosition.setWithKeys(
      { entity: motherlodeEntity as string, __staticData: "", __encodedLengths: "", __dynamicData: "" },
      motherlodePosition
    );

    if (!isMotherlode(motherlodeEntity, Number(config.motherlodeChanceInv))) continue;

    const { size: rawSize, motherlodeType: rawMotherlodeType } = getMotherlodeRawPrototype(motherlodeEntity);
    const motherlodeType = getMotherlodeType(rawMotherlodeType);
    const rawResource = components.P_RawResource.getWithKeys({ resource: motherlodeType })?.value;
    const size = getSize(rawSize);
    components.Motherlode.set({ ...emptyData, size, motherlodeType }, motherlodeEntity);
    components.Position.set({ ...emptyData, ...motherlodePosition, parent: toHex32("0") }, motherlodeEntity);
    components.RockType.set({ ...emptyData, value: ERock.Motherlode }, motherlodeEntity);

    if (rawResource) {
      const value = components.P_SizeToAmount.getWithKeys({ size: size })?.value ?? 1n;
      components.MaxResourceCount.setWithKeys(
        { ...emptyData, value },
        { entity: motherlodeEntity as Hex, resource: rawResource }
      );
      components.ResourceCount.setWithKeys(
        { ...emptyData, value },
        { entity: motherlodeEntity as Hex, resource: rawResource }
      );
    }
  }
}

function isMotherlode(entity: Entity, chanceInv: number) {
  const motherlodeType = getByteUInt(entity, 6, 128);
  return motherlodeType % chanceInv === 1;
}

function getSize(size: number) {
  if (size <= 16) return ESize.Small;
  if (size <= 26) return ESize.Medium;
  return ESize.Large;
}

function getMotherlodeType(motherlodeType: number) {
  if (motherlodeType <= 11) return EResource.Titanium;
  if (motherlodeType < 21) return EResource.Iridium;
  if (motherlodeType < 27) return EResource.Platinum;
  return EResource.Kimberlite;
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
