// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID, ResourceValue } from "../components/BuildingProductionComponent.sol";
import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "../components/PlayerProductionComponent.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibResource } from "./LibResource.sol";

library LibFactory {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function updateProduction(IWorld world, uint256 playerEntity, uint256 factoryLevelEntity, bool increase) internal {
    PlayerProductionComponent playerProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
    );
    BuildingProductionComponent buildingProductionComponent = BuildingProductionComponent(
      world.getComponent(BuildingProductionComponentID)
    );
    ResourceValue memory productionData = buildingProductionComponent.getValue(factoryLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(productionData.resource, playerEntity);
    uint32 newResourceProductionRate = increase
      ? LibMath.getSafe(playerProductionComponent, playerResourceEntity) + productionData.value
      : LibMath.getSafe(playerProductionComponent, playerResourceEntity) - productionData.value;
    LibResource.updateResourceProduction(world, playerResourceEntity, newResourceProductionRate);
  }
}
