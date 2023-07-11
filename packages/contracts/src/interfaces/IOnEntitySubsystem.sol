// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IOnEntitySubsystem {
  function executeTyped(address playerAddress, uint256 entity) external returns (bytes memory);
}
