// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint32Component } from "std-contracts/components/Uint32Component.sol";

import { addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetMineBuildingProductionForLevel {
  function setMineBuildingProductionForLevel(
    Uint32Component mineProductionComponent,
    uint256 entity,
    uint32 level,
    uint32 productionPerBlock
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    mineProductionComponent.set(buildingIdLevel, productionPerBlock);
  }
}
