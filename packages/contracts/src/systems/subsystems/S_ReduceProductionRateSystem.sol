// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";

contract S_ReduceProductionRateSystem is PrimodiumSystem {
  function reduceProductionRate(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    uint256 level
  ) public {
    LibReduceProductionRate.reduceProductionRate(playerEntity, buildingEntity, level);
  }

  function clearProductionRateReduction(bytes32 playerEntity, bytes32 buildingEntity) public {
    LibReduceProductionRate.clearProductionRateReduction(playerEntity, buildingEntity);
  }
}
