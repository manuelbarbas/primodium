import { Entity } from "@latticexyz/recs";
import { encodeEntity } from "@latticexyz/store-sync/recs";
import { Coord } from "@latticexyz/utils";
import { Hex, encodeAbiParameters, keccak256, toHex, trim } from "viem";

export const toHex32 = (input: string) => toHex(input, { size: 32 });

export function encodeNumberEntity(key: number, entity: string): Entity {
  return encodeEntity({ key: "uint16", entity: "bytes32" }, { key, entity: toHex32(entity) });
}

export function encodeKeyEntity(key: string, entity: string): Entity {
  return encodeEntity({ key: "bytes32", entity: "bytes32" }, { key: toHex32(key), entity: toHex32(entity) });
}

// convert the following solidity function to typescript:
export function encodeCoord(coord: Coord) {
  let x: number = coord.x;
  let y: number = coord.y;

  // Ensure the numbers are within int32 range
  if (x > 0x7fffffff || x < -0x80000000 || y > 0x7fffffff || y < -0x80000000) {
    throw new Error("Coordinates out of int32 range");
  }

  // Convert to uint32
  x = x >>> 0;
  y = y >>> 0;

  // Shift the bits of the first int32 32 bits to the left and OR it with the second int32
  const result = (BigInt(x) << BigInt(32)) | BigInt(y);
  return trim(("0x" + result.toString(16).padStart(64, "0")) as Hex);
}

export function decodeCoord(encodedValue: Entity) {
  const bigInt = BigInt(encodedValue);
  // Extract the y value (rightmost 32 bits)
  const y = Number(bigInt & BigInt(0xffffffff));

  // Right shift by 32 bits to extract the x value
  const x = Number(bigInt >> BigInt(32));

  // Convert uint32 back to int32
  const int32_x: number = (x << 0) >> 0;
  const int32_y: number = (y << 0) >> 0;

  return {
    x: int32_x,
    y: int32_y,
  };
}
export const getMotherlodeEntity = (sourceEntity: Entity, position: Coord) =>
  encodeEntity(
    { sourceEntity: "bytes32", motherlode: "bytes32", x: "int32", y: "int32" },
    { sourceEntity: sourceEntity as Hex, motherlode: toHex32("motherlode"), x: position.x, y: position.y }
  );

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
