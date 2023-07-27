pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, ResourceValue } from "components/FactoryProductionComponent.sol";
import { addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetFactoryProductionForLevel {
  function setFactoryProductionForLevel(
    FactoryProductionComponent factoryProductionComponent,
    uint256 entity,
    uint32 level,
    uint256 resourceId,
    uint32 productionPerBlock
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    factoryProductionComponent.set(buildingIdLevel, ResourceValue(resourceId, productionPerBlock));
  }
}
