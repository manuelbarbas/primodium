// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { P_EnumToPrototype } from "codegen/Tables.sol";

import { LibResource } from "codegen/Libraries.sol";
import { EBuilding } from "src/Types.sol";
import { BuildingKey } from "src/Keys.sol";

contract S_SpendResourcesSystem is PrimodiumSystem {
  function spendRequiredResources(bytes32 buildingEntity, uint256 level) public {
    LibResource.spendRequiredResources(buildingEntity, level);
  }
}
