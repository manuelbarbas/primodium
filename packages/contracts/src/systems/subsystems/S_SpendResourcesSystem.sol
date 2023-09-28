// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibResource } from "libraries/LibResource.sol";

contract S_SpendResourcesSystem is PrimodiumSystem {
  function spendBuildingRequiredResources(bytes32 entity, uint256 level) public {
    LibResource.spendBuildingRequiredResources(entity, level);
  }

  function spendUnitRequiredResources(bytes32 player, bytes32 unitPrototype) public {
    LibResource.spendUnitRequiredResources(player, unitPrototype);
  }
}
