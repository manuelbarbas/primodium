// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

library LibEncode {
  function hashFromStringAddress(string memory str, address addr) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(str, addr)));
  }

  function hashFromAddress(uint256 key, address addr) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(key, addr)));
  }

  function hashFromKey(uint256 key, uint256 key2) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(key, key2)));
  }

  function hashFromTwoKeys(uint256 key, uint256 key2, uint256 key3) internal pure returns (uint256) {
    return uint256(keccak256(abi.encodePacked(key, key2, key3)));
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
}
