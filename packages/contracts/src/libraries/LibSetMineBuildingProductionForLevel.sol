pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";

import { addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

library LibSetMineBuildingProductionForLevel {
  function setMineBuildingProductionForLevel(
    Uint256Component mineComponent,
    uint256 entity,
    uint256 level,
    uint256 productionPerBlock
  ) internal {
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(entity, level);
    mineComponent.set(buildingIdLevel, productionPerBlock);
  }
}
