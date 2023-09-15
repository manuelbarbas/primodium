// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { EBuilding, EResource } from "src/Types.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { SetPlayerResource } from "libraries/SetPlayerResource.sol";
import { P_IsUtility, P_RequiredResources, P_RequiredResourcesData, P_EnumToPrototype, UtilityUsage, LastClaimedAt, ProductionRate } from "codegen/Tables.sol";
import { BuildingKey } from "src/Keys.sol";

library LibResource {
  /// notice: this function should only be called after all resources have been claimed
  /// notice: this function adds resources from the last claimed time

  function spendRequiredResources(
    bytes32 playerEntity,
    EBuilding building,
    uint32 level
  ) internal returns (bool) {
    spendRequiredResources(playerEntity, P_EnumToPrototype.get(BuildingKey, uint8(building)), level);
  }

  function spendRequiredResources(
    bytes32 playerEntity,
    bytes32 buildingPrototype,
    uint32 level
  ) internal returns (bool) {
    claimAllResources(playerEntity);

    P_RequiredResourcesData memory requiredResources = P_RequiredResources.get(buildingPrototype, level);

    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      EResource resource = EResource(requiredResources.resources[i]);

      // check if player has enough resources
      uint32 resourceCost = requiredResources.amounts[i];
      uint32 playerResourceCount = SetPlayerResource.get(playerEntity, resource);
      require(resourceCost <= playerResourceCount, "[SpendResources] Not enough resources to spend");

      // spend resources
      LibStorage.decreaseStoredResource(playerEntity, resource, resourceCost);

      // add total utility usage to building
      if (P_IsUtility.get(resource)) {
        uint32 prevUtilityUsage = UtilityUsage.get(playerEntity, resource);
        UtilityUsage.set(playerEntity, resource, prevUtilityUsage + resourceCost);
      }
    }
  }

  function claimAllResources(bytes32 playerEntity) internal {
    uint8[] memory resources = SetPlayerResource.getAll(playerEntity);
    uint256 lastClaimed = LastClaimedAt.get(playerEntity);
    if (lastClaimed == 0 || lastClaimed == block.timestamp) return;
    LastClaimedAt.set(playerEntity, block.timestamp);
    for (uint256 i = 0; i < resources.length; i++) {
      EResource resource = EResource(resources[i]);
      // you can't claim utilities
      if (P_IsUtility.get(resource)) continue;

      // you have no production rate
      uint32 productionRate = ProductionRate.get(playerEntity, resource);
      if (productionRate == 0) continue;

      // add resource to storage
      uint32 unclaimedResource = (productionRate * uint32(block.timestamp - lastClaimed));
      LibStorage.increaseStoredResource(playerEntity, resource, unclaimedResource);
    }
  }

  function clearUtilityUsage(
    bytes32 playerEntity,
    bytes32 buildingEntity,
    EResource utility
  ) internal {
    uint32 utilityUsage = UtilityUsage.get(playerEntity, utility);
    UtilityUsage.deleteRecord(playerEntity, utility);
    LibStorage.increaseStoredResource(playerEntity, utility, utilityUsage);
  }

  // function canProduceResources(
  //   bytes32 playerEntity,
  //   bytes32 buildingPrototype,
  //   uint32 level
  // ) internal view returns (bool) {
  //   uint256 entityTypeLevelEntity = LibEncode.hashKeyEntity(entityType, level);

  //   if (!productionDependenciesComponent.has(entityTypeLevelEntity)) return true;

  //   ResourceValues memory requiredProductions = productionDependenciesComponent.getValue(entityTypeLevelEntity);
  //   ResourceValues memory lastLevelRequiredProductions;
  //   if (level > 1) {
  //     entityTypeLasteLevelEntity = LibEncode.hashKeyEntity(entityType, level - 1);
  //     lastLevelRequiredProductions = productionDependenciesComponent.getValue(entityTypeLasteLevelEntity);
  //   }
  //   ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
  //   for (uint256 i = 0; i < requiredProductions.resources.length; i++) {
  //     uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredProductions.resources[i], playerEntity);
  //     if (!productionComponent.has(playerResourceEntity)) return false;
  //     uint256 requiredValue = requiredProductions.values[i];
  //     if (level > 1) {
  //       requiredValue -= lastLevelRequiredProductions.values[i];
  //     }
  //     if (LibMath.getSafe(productionComponent, playerResourceEntity) < requiredValue) return false;
  //   }
  //   return true;
  // }

  // function checkCanReduceProduction(
  //   IWorld world,
  //   uint256 playerEntity,
  //   uint256 entityType,
  //   uint32 level
  // ) internal view returns (bool) {
  //   P_ProductionComponent p_ProductionComponent = P_ProductionComponent(world.getComponent(P_ProductionComponentID));
  //   ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));

  //   uint256 entityTypeLevelEntity = LibEncode.hashKeyEntity(entityType, level);

  //   if (!p_ProductionComponent.has(entityTypeLevelEntity)) return true;

  //   uint256 entityTypeLasteLevelEntity;

  //   ResourceValue memory entityLevelProduction = p_ProductionComponent.getValue(entityTypeLevelEntity);
  //   uint256 playerResourceEntity = LibEncode.hashKeyEntity(entityLevelProduction.resource, playerEntity);
  //   return LibMath.getSafe(productionComponent, playerResourceEntity) >= entityLevelProduction.value;
  // }

  // function updateRequiredProduction(
  //   IWorld world,
  //   uint256 playerEntity,
  //   uint256 entityType,
  //   uint32 level,
  //   bool isApply
  // ) internal {
  //   P_ProductionDependenciesComponent productionDependenciesComponent = P_ProductionDependenciesComponent(
  //     world.getComponent(P_ProductionDependenciesComponentID)
  //   );
  //   uint256 entityTypeLevelEntity = LibEncode.hashKeyEntity(entityType, level);
  //   if (!productionDependenciesComponent.has(entityTypeLevelEntity)) return;
  //   ResourceValues memory requiredProductions = productionDependenciesComponent.getValue(entityTypeLevelEntity);
  //   ResourceValues memory lastLevelRequiredProductions;
  //   uint256 entityTypeLasteLevelEntity;
  //   if (isApply && level > 1) {
  //     entityTypeLasteLevelEntity = LibEncode.hashKeyEntity(entityType, level - 1);
  //     lastLevelRequiredProductions = productionDependenciesComponent.getValue(entityTypeLasteLevelEntity);
  //   }
  //   ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
  //   for (uint256 i = 0; i < requiredProductions.resources.length; i++) {
  //     uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredProductions.resources[i], playerEntity);
  //     uint32 requiredValue = requiredProductions.values[i];
  //     if (isApply && level > 1) {
  //       requiredValue -= lastLevelRequiredProductions.values[i];
  //     }
  //     if (requiredValue == 0) continue;

  //     IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
  //       entityToAddress(playerEntity),
  //       requiredProductions.resources[i]
  //     );

  //     if (isApply) {
  //       productionComponent.set(
  //         playerResourceEntity,
  //         productionComponent.getValue(playerResourceEntity) - requiredValue
  //       );
  //     } else {
  //       productionComponent.set(
  //         playerResourceEntity,
  //         productionComponent.getValue(playerResourceEntity) + requiredValue
  //       );
  //     }
  //   }
  // }
}
