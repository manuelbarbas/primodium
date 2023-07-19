// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IOnTwoEntitySubsystem {
  function executeTyped(address playerAddress, uint256 entity1, uint256 entity2) external returns (bytes memory);
}
