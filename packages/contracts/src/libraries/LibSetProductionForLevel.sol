// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { ProductionComponent, ID as ProductionComponentID, ResourceValue } from "components/ProductionComponent.sol";
import { addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetProductionForLevel {
  function setProductionForLevel(
    ProductionComponent productionComponent,
    uint256 entity,
    uint32 level,
    uint256 resourceId,
    uint32 productionPerBlock
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    productionComponent.set(buildingIdLevel, ResourceValue(resourceId, productionPerBlock));
  }
}
