import { resourceToHex } from "@latticexyz/common";
import { Entity } from "@latticexyz/recs";
import { Coord } from "@/lib/types";
import { Hex, encodeAbiParameters, isHex, keccak256, size, sliceHex, toHex } from "viem";
import { encodeEntity } from "@latticexyz/store-sync/recs";

export const getSystemId = (name: string, namespace = "Pri_11") =>
  resourceToHex({ type: "system", name, namespace: namespace.toLowerCase() == "core" ? "" : namespace });

export const addressToEntity = (address: Hex) => {
  return encodeAbiParameters([{ type: "address" }], [address]) as Entity;
};

export const toHex32 = (input: string | number | bigint | boolean) => toHex(input, { size: 32 });

export function encodeNumberEntity(key: number, entity: string): Entity {
  return encodeEntity({ key: "uint16", entity: "bytes32" }, { key, entity: toHex32(entity) });
}

export function encodeKeyEntity(key: string, entity: string): Entity {
  return encodeEntity({ key: "bytes32", entity: "bytes32" }, { key: toHex32(key), entity: toHex32(entity) });
}

export function hashEntities(...args: (Entity | string | number)[]) {
  const values = args.reduce((prev, arg) => `${prev}${arg}`, "") as Hex;
  return keccak256(values) as Entity;
}

// Identical to hashKeyEntity in packages/contracts/src/libraries/LibEncode.sol
export function hashKeyEntity(key: Hex, entity: Entity): Entity {
  // Compute the Keccak-256 hash of the concatenated key and entity
  return keccak256(
    encodeAbiParameters(
      [
        { name: "key", type: "bytes32" },
        { name: "entity", type: "bytes32" },
      ],
      [key, entity as Hex]
    )
  ) as Entity;
}

export function entityToHexKeyTuple(entity: Entity): readonly Hex[] {
  if (!isHex(entity)) {
    throw new Error(`entity ${entity} is not a hex string`);
  }
  const length = size(entity);
  if (length % 32 !== 0) {
    throw new Error(`entity length ${length} is not a multiple of 32 bytes`);
  }
  return new Array(length / 32).fill(0).map((_, index) => sliceHex(entity, index * 32, (index + 1) * 32));
}

export const getSecondaryAsteroidEntity = (sourceEntity: Entity, position: Coord) =>
  keccak256(
    encodeEntity(
      { sourceEntity: "bytes32", asteroid: "bytes32", x: "int32", y: "int32" },
      { sourceEntity: sourceEntity as Hex, asteroid: toHex32("asteroid"), x: position.x, y: position.y }
    ) as Hex
  ) as Entity;

export const getBuildingPositionEntity = (coord: Coord, asteroid: Entity) => {
  return encodeEntity(
    { x: "int32", y: "int32", asteroid: "bytes32" },
    { x: coord.x, y: coord.y, asteroid: asteroid as Hex }
  );
};
