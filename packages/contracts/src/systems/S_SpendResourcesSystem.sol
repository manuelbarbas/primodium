// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { P_EnumToPrototype } from "codegen/Tables.sol";

import { LibResource } from "codegen/Libraries.sol";
import { EBuilding } from "src/Types.sol";
import { BuildingKey } from "src/Keys.sol";

contract S_SpendResourcesSystem is PrimodiumSystem {
  function spendRequiredResources(bytes32 buildingPrototype, uint32 level) public returns (bytes32 buildingEntity) {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibResource.spendRequiredResources(playerEntity, buildingPrototype, level);
  }

  function spendRequiredResources(EBuilding buildingType, uint32 level) public returns (bytes32 buildingEntity) {
    spendRequiredResources(P_EnumToPrototype.get(BuildingKey, uint8(buildingType)), level);
  }
}
