import { BigNumber, utils } from "ethers";
import { defaultAbiCoder, solidityKeccak256 } from "ethers/lib/utils";

import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";
import { ContractCoord } from "./types";

// use this when you want to pass the entity to world.getEntityIndex
export function encodeAndTrimCoord(coord: Coord): EntityID {
  return trim(encodeCoord(coord));
}

// convert the following solidity function to typescript:
export function encodeCoord(coord: Coord): EntityID {
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
  return trim(("0x" + result.toString(16).padStart(64, "0")) as EntityID);
}

export function decodeCoord(encodedValue: EntityID) {
  const bigInt = BigInt(encodedValue);
  // Extract the y value (rightmost 32 bits)
  const y: number = Number(bigInt & BigInt(0xffffffff));

  // Right shift by 32 bits to extract the x value
  const x: number = Number(bigInt >> BigInt(32));

  // Convert uint32 back to int32
  const int32_x: number = (x << 0) >> 0;
  const int32_y: number = (y << 0) >> 0;

  return {
    x: int32_x,
    y: int32_y,
  };
}
export function getMotherlodeEntity(sourceEntity: EntityID, position: Coord) {
  return solidityKeccak256(
    ["bytes"],
    [
      defaultAbiCoder.encode(
        ["uint256", "string", "int32", "int32"],
        [sourceEntity, "motherlode", position.x, position.y]
      ),
    ]
  ) as EntityID;
}

export function hashEntities(...args: (EntityID | string | number)[]) {
  const types = args.map(() => "uint256");
  const values = args.map((arg) => BigNumber.from(arg));
  return solidityKeccak256(types, values) as EntityID;
}

export function hashAndTrimKeyEntity(
  key: string | EntityID | number,
  entity: EntityID | string | number
): EntityID {
  return trim(hashKeyEntity(key, entity));
}

// Identical to hashKeyEntity in packages/contracts/src/libraries/LibEncode.sol
export function hashKeyEntity(
  key: EntityID | string | number,
  entity: EntityID | string | number
): EntityID {
  // Compute the Keccak-256 hash of the concatenated key and entity
  return solidityKeccak256(
    ["uint256", "uint256"],
    [BigNumber.from(key), BigNumber.from(entity)]
  ) as EntityID;
}
// Identical to hashKeyEntity (with string param) in packages/contracts/src/libraries/LibEncode.sol
export function hashStringEntity(
  key: string,
  entity: EntityID | string | number
): EntityID {
  // Compute the Keccak-256 hash of the concatenated key and entity
  return solidityKeccak256(
    ["bytes", "uint256"],
    [utils.toUtf8Bytes(key), BigNumber.from(entity)]
  ) as EntityID;
}
// Remove leading zeros due to mudv1 hashing behavior
// if there are leading zeroes, the key in world.entityToIndex will be trimmed
export function trim(entity: EntityID): EntityID {
  return BigNumber.from(entity).toHexString() as EntityID;
}

export function hashEntity(entity: EntityID) {
  return solidityKeccak256(["uint256"], [BigNumber.from(entity)]) as EntityID;
}

export function hashAndTrimKeyCoord(
  key: string,
  coord: ContractCoord
): EntityID {
  return trim(hashKeyCoord(key, coord));
}

export function hashKeyCoord(key: string, coord: ContractCoord): EntityID {
  return solidityKeccak256(
    ["string", "int32", "int32", "uint256"],
    [key, coord.x, coord.y, trim(coord.parent)]
  ) as EntityID;
}

export function padTo64Bytes(hex: string): string {
  // Remove "0x" prefix if present
  const cleanHex = hex.startsWith("0x") ? hex.slice(2) : hex;
  // Pad the hex string with zeros to 64 characters (32 bytes)
  const paddedHex = cleanHex.padStart(64, "0");
  // Add "0x" prefix back
  const result = "0x" + paddedHex;
  return result;
}
