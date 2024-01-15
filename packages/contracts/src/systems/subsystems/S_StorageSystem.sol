// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibStorage } from "libraries/LibStorage.sol";
import { IsActive, Level } from "codegen/index.sol";

contract S_StorageSystem is PrimodiumSystem {
  function increaseMaxStorage(bytes32 buildingEntity, uint32 level) public {
    LibStorage.increaseMaxStorage(buildingEntity, level);
  }

  function clearMaxStorageIncrease(bytes32 buildingEntity) public {
    if (IsActive.get(buildingEntity)) LibStorage.clearMaxStorageIncrease(buildingEntity);
  }

  function activateMaxStorage(bytes32 buildingEntity) public {
    if (IsActive.get(buildingEntity)) {
      LibStorage.activateMaxStorage(buildingEntity, Level.get(buildingEntity));
    } else {
      LibStorage.clearMaxStorageIncrease(buildingEntity);
    }
  }
}
