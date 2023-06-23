// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import {Coord} from "std-contracts/components/CoordComponent.sol";
import {split} from "solecs/utils.sol";


library LibEncode {
  function hashFromStringAddress(string memory str, address addr) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(str, addr)));
  }

  function hashFromAddress(uint256 key, address addr) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(key, addr)));
  }

  function hashEqualToString(uint256 a, string memory b) internal pure returns (bool) {
    return a == uint256(keccak256(abi.encodePacked(b)));
  }

  function hashEqual(uint256 a, uint256 b) internal pure returns (bool) {
    return a == b;
  }

  function stringsEqual(string memory a, string memory b) internal pure returns (bool) {
    return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
  }

  function encodeCoordEntity(Coord memory coord, string memory key) internal pure returns (uint256) {
    return uint256(bytes32(bytes.concat(bytes4(uint32(coord.x)), bytes4(uint32(coord.y)), bytes24(bytes(key)))));
  }

  function decodeCoordEntity(uint256 entity) internal pure returns (Coord memory) {
    bytes memory data = abi.encode(bytes32(entity));
    uint8[] memory sizes = new uint8[](2);
    sizes[0] = 4;
    sizes[1] = 4;
    bytes[] memory decoded = split(data, sizes);
    return Coord(int32(uint32(bytes4(decoded[0]))), int32(uint32(bytes4(decoded[1]))));
  }
}
