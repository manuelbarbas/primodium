import { BigNumber } from "ethers";
import { solidityKeccak256 } from "ethers/lib/utils";

import { EntityID } from "@latticexyz/recs";
import { Coord } from "@latticexyz/utils";

import { Buffer } from "buffer";

// use this when you want to pass the entity to world.getEntityIndex
export function encodeCoordEntityAndTrim(coord: Coord, key: string): EntityID {
  return BigNumber.from(
    encodeCoordEntity(coord, key)
  ).toHexString() as unknown as EntityID;
}

// Identical to encodeCoordEntity in packages/contracts/src/libraries/LibEncode.sol
export function encodeCoordEntity(coord: Coord, key: string): EntityID {
  function encodeCoordinate(value: number): Buffer {
    const bytes = Buffer.alloc(4);
    if (value >= 0) {
      bytes.writeInt32BE(value);
    } else {
      // Use two's complement for negative values
      bytes.writeUInt32BE(value >>> 0);
    }
    return bytes;
  }
  const xBytes = encodeCoordinate(coord.x);
  const yBytes = encodeCoordinate(coord.y);
  let keyBytes = Buffer.from(key);
  const desiredKeyLength = 24;
  if (keyBytes.length < desiredKeyLength) {
    keyBytes = Buffer.concat([
      keyBytes,
      Buffer.alloc(desiredKeyLength - keyBytes.length),
    ]);
  } else if (keyBytes.length > desiredKeyLength) {
    keyBytes = keyBytes.subarray(0, desiredKeyLength);
  }
  const concatenatedBytes = Buffer.concat([xBytes, yBytes, keyBytes]);
  const encodedValue = `0x${concatenatedBytes.toString("hex")}`;
  return encodedValue as EntityID;
}

// Identical to decodeCoordEntity in packages/contracts/src/libraries/LibEncode.sol
export function decodeCoordEntity(entity: EntityID): Coord {
  // Utility to plit buffer data into bytes sizes
  function split(data: Buffer, sizes: number[]): Buffer[] {
    const result: Buffer[] = [];
    let offset = 0;
    for (const size of sizes) {
      result.push(data.subarray(offset, offset + size));
      offset += size;
    }
    return result;
  }
  // Correctly convert negative signed integers
  function getInt32FromBuffer(buffer: Buffer): number {
    const value = buffer.readInt32BE();
    // If the most significant bit is set, the number is negative
    return value >= 0x80000000 ? value - 0x100000000 : value;
  }
  const data = Buffer.from(padTo64Bytes(entity).slice(2), "hex");
  const sizes = [4, 4];
  const decoded = split(data, sizes);
  const x = getInt32FromBuffer(decoded[0]);
  const y = getInt32FromBuffer(decoded[1]);
  return { x, y };
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

// Remove leading zeros due to mudv1 hashing behavior
// if there are leading zeroes, the key in world.entityToIndex will be trimmed
export function hashKeyEntityAndTrim(
  key: EntityID,
  entity: EntityID | string
): string {
  return BigNumber.from(hashKeyEntity(key, entity)).toHexString();
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
