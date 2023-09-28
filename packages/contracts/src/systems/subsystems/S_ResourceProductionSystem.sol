// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibProduction } from "libraries/LibProduction.sol";

contract S_ResourceProductionSystem is PrimodiumSystem {
  function upgradeResourceProduction(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint256 level
  ) public {
    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, level);
  }

  function clearResourceProduction(bytes32 playerEntity, bytes32 buildingEntity) public {
    LibProduction.clearResourceProduction(playerEntity, buildingEntity);
  }
}
