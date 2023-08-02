// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

interface IOnBuildingSubsystem {
  function executeTyped(
    address playerAddress,
    uint256 buildingType,
    uint32 buildingLevel,
    bool isDestroy
  ) external returns (bytes memory);
}
