// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { IWorld } from "solecs/System.sol";
import { Coord } from "../types.sol";
import { split } from "solecs/utils.sol";

library LibEncode {
  function hashEntity(uint256 entity) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(entity)));
  }

  function hashEntity(IWorld world, uint256 entity) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(address(world), entity)));
  }

  function hashKeyEntity(uint256 key, uint256 entity) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(key, entity)));
  }

  function hashEntities(uint256 entity1, uint256 entity2, uint256 entity3) internal pure returns (uint256) {
    return uint256(keccak256(abi.encode(entity1, entity2, entity3)));
  }

  function hashKeyCoord(string memory key, Coord memory coord) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(key, coord.x, coord.y, coord.parent)));
  }

  // Function that encodes two int32 values into a single uint256
  function encodeCoord(Coord memory coord) internal pure returns (uint256) {
    uint32 x = uint32(coord.x);
    uint32 y = uint32(coord.y);

    // Shift the bits of the first int32 32 bits to the left and OR it with the second int32
    return (uint256(x) << 32) | y;
  }

  // Function that decodes a uint256 into two int32 values
  function decodeCoord(uint256 encoded) internal pure returns (Coord memory coord) {
    // Right shift the encoded value by 32 bits to get the first int32
    coord.x = int32(uint32(encoded >> 32));

    // Masking with 0xFFFFFFFF gives the second int32
    coord.y = int32(uint32(encoded & 0xFFFFFFFF));
  }
}
