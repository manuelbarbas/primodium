// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibStorage } from "libraries/LibStorage.sol";

contract S_MaxStorageSystem is PrimodiumSystem {
  function increaseMaxStorage(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint256 level
  ) public {
    LibStorage.increaseMaxStorage(playerEntity, buildingEntity, level);
  }

  function clearMaxStorageIncrease(bytes32 playerEntity, bytes32 buildingEntity) public {
    LibStorage.clearMaxStorageIncrease(playerEntity, buildingEntity);
  }
}
