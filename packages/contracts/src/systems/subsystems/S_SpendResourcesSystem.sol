// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibResource } from "codegen/Libraries.sol";

contract S_SpendResourcesSystem is PrimodiumSystem {
  function spendRequiredResources(bytes32 entity, uint256 level) public {
    LibResource.spendRequiredResources(entity, level);
  }
}
