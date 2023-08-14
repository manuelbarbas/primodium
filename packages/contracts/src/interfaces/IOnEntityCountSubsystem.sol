// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IOnEntityCountSubsystem {
  function executeTyped(address playerAddress, uint256 entity, uint32 count) external returns (bytes memory);
}
