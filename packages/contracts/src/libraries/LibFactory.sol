// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { ProductionComponent, ID as ProductionComponentID, ResourceValue } from "../components/ProductionComponent.sol";
import { TotalProductionComponent, ID as TotalProductionComponentID } from "../components/TotalProductionComponent.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibResource } from "./LibResource.sol";

library LibFactory {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function updateProduction(IWorld world, uint256 playerEntity, uint256 factoryLevelEntity, bool increase) internal {
    TotalProductionComponent totalProductionComponent = TotalProductionComponent(
      world.getComponent(TotalProductionComponentID)
    );
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    ResourceValue memory productionData = productionComponent.getValue(factoryLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(productionData.resource, playerEntity);
    uint32 newResourceProductionRate = increase
      ? LibMath.getSafe(totalProductionComponent, playerResourceEntity) + productionData.value
      : LibMath.getSafe(totalProductionComponent, playerResourceEntity) - productionData.value;
    LibResource.updateResourceProduction(world, playerResourceEntity, newResourceProductionRate);
  }
}
