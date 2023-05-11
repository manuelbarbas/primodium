import { solidityKeccak256, getAddress } from "ethers/lib/utils";
import { BigNumber } from "ethers";

import { EntityID } from "@latticexyz/recs";

// Valid addresses need to be truncated to uint160 to be recognized as valid addresses
// that could be hashed for component keys
export function applyUint160Mask(key: EntityID): string {
  // Create a mask to limit the value to 160 bits (equivalent to uint160)
  const uint160Mask: BigNumber = BigNumber.from(
    "0xffffffffffffffffffffffffffffffffffffffff"
  );

  // Convert the key to a BigNumber
  const entity: BigNumber = BigNumber.from(key.toString());

  // Apply the mask using the bitwise AND operation
  const uint160Value: BigNumber = entity.and(uint160Mask);

  // Convert the resulting BigNumber to a hexadecimal string representing the address
  const addr: string = uint160Value.toHexString();

  return getAddress(addr);
}

// Identical to hashFromAddress in packages/contracts/src/libraries/LibHash.sol
export function hashFromAddress(key: EntityID, addr: string): string {
  // Normalize and validate the address
  const normalizedAddr: string = getAddress(addr);

  // Compute the Keccak-256 hash of the concatenated key and address
  const hash: string = solidityKeccak256(
    ["uint256", "address"],
    [BigNumber.from(key), normalizedAddr]
  );

  return hash;
}
