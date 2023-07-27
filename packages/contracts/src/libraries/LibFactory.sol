// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { ProductionComponent, ID as ProductionComponentID, ResourceValue } from "../components/ProductionComponent.sol";
import { MineProductionComponent, ID as MineProductionComponentID } from "../components/MineProductionComponent.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibResource } from "./LibResource.sol";

library LibFactory {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function updateProduction(IWorld world, uint256 playerEntity, uint256 factoryLevelEntity, bool increase) internal {
    MineProductionComponent mineProductionComponent = MineProductionComponent(
      world.getComponent(MineProductionComponentID)
    );
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    ResourceValue memory productionData = productionComponent.getValue(factoryLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(productionData.resource, playerEntity);
    uint32 newResourceProductionRate = increase
      ? LibMath.getSafeUint32(mineProductionComponent, playerResourceEntity) + productionData.value
      : LibMath.getSafeUint32(mineProductionComponent, playerResourceEntity) - productionData.value;
    LibResource.updateResourceProduction(world, playerResourceEntity, newResourceProductionRate);
  }
}
