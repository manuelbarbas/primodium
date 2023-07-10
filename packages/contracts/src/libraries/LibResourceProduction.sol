pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "../components/FactoryProductionComponent.sol";

import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";

library LibResourceProduction {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function updateResourceProduction(
    Uint256Component mineComponent,
    Uint256Component lastClaimedAtComponent,
    uint256 entity,
    uint256 newResourceProductionRate
  ) internal {
    if (newResourceProductionRate <= 0) {
      lastClaimedAtComponent.remove(entity);
      mineComponent.remove(entity);
      return;
    }
    if (!lastClaimedAtComponent.has(entity)) lastClaimedAtComponent.set(entity, block.number);
    mineComponent.set(entity, newResourceProductionRate);
  }
}
