import { Entity } from "@latticexyz/recs";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { Coord } from "@latticexyz/utils";
import { Hex, encodeAbiParameters, keccak256, toHex } from "viem";

export const toHex32 = (input: string | number | bigint | boolean) => toHex(input, { size: 32 });

export function encodeNumberEntity(key: number, entity: string): Entity {
  return encodeEntity({ key: "uint16", entity: "bytes32" }, { key, entity: toHex32(entity) });
}

export function encodeKeyEntity(key: string, entity: string): Entity {
  return encodeEntity({ key: "bytes32", entity: "bytes32" }, { key: toHex32(key), entity: toHex32(entity) });
}

export const getMotherlodeEntity = (sourceEntity: Entity, position: Coord) =>
  keccak256(
    encodeEntity(
      { sourceEntity: "bytes32", motherlode: "bytes32", x: "int32", y: "int32" },
      { sourceEntity: sourceEntity as Hex, motherlode: toHex32("motherlode"), x: position.x, y: position.y }
    ) as Hex
  ) as Entity;

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
