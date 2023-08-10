// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_UnitProductionTypesComponent, ID as P_UnitProductionTypesComponentID } from "components/P_UnitProductionTypesComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibUtilityResource } from "./LibUtilityResource.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { ResourceValues } from "../types.sol";

library LibUnits {
  function canBuildingProduceUnit(IWorld world, uint256 buildingEntity, uint256 unitType) internal view returns (bool) {
    P_UnitProductionTypesComponent unitProductionTypesComponent = P_UnitProductionTypesComponent(
      world.getComponent(P_UnitProductionTypesComponentID)
    );
    uint256 buildingType = BuildingTypeComponent(world.getComponent(BuildingTypeComponentID)).getValue(buildingEntity);
    uint32 buildingLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(buildingEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!unitProductionTypesComponent.has(buildingLevelEntity)) return false;

    uint256[] memory unitTypes = unitProductionTypesComponent.getValue(buildingLevelEntity);
    for (uint256 i = 0; i < unitTypes.length; i++) {
      if (unitTypes[i] == unitType) return true;
    }
    return false;
  }

  function checkUtilityResourceReqs(
    IWorld world,
    uint256 playerEntity,
    uint256 unitType,
    uint32 count
  ) internal view returns (bool) {
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      world.getComponent(P_RequiredUtilityComponentID)
    );
    uint32 unitLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(
      LibEncode.hashKeyEntity(unitType, playerEntity)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(unitType, unitLevel);
    if (!requiredUtilityComponent.has(buildingLevelEntity)) return true;

    uint256[] memory resourceIDs = requiredUtilityComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(buildingLevelEntity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint32 requiredAmount = requiredAmounts[i] * count;
      if (LibUtilityResource.getAvailableUtilityCapacity(world, playerEntity, resourceIDs[i]) < requiredAmount) {
        return false;
      }
    }
    return true;
  }

  //checks all required conditions for a factory to be functional and updates factory is functional status
  function getPlayerUnitTypeLevel(
    IWorld world,
    uint256 playerEntity,
    uint256 unitType
  ) internal view returns (uint256) {
    uint256 playerUnitEntity = LibEncode.hashKeyEntity(unitType, playerEntity);
    return LibMath.getSafe(LevelComponent(world.getComponent(LevelComponentID)), playerUnitEntity);
  }

  function getUnitResourceCosts(
    IWorld world,
    uint256 unitType,
    uint256 playerEntity
  ) internal view returns (ResourceValues memory) {
    uint256 playerUnitLevel = getPlayerUnitTypeLevel(world, playerEntity, unitType);
    uint256 unitLevelEntity = LibEncode.hashKeyEntity(unitType, playerUnitLevel);
    return P_RequiredResourcesComponent(world.getComponent(P_RequiredResourcesComponentID)).getValue(unitLevelEntity);
  }

  function hasRequiredResources(
    IWorld world,
    uint256 playerEntity,
    uint256 unitType,
    uint32 count
  ) internal view returns (bool) {
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    ResourceValues memory requiredResources = getUnitResourceCosts(world, unitType, playerEntity);

    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      uint32 resourceCost = requiredResources.values[i] * count;
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity);
      uint32 playerResourceCount = LibMath.getSafe(itemComponent, playerResourceEntity);

      if (LibMath.getSafe(productionComponent, playerResourceEntity) > 0) {
        playerResourceCount +=
          productionComponent.getValue(playerResourceEntity) *
          uint32(block.number - LibMath.getSafe(lastClaimedAtComponent, playerResourceEntity));
      }

      if (resourceCost > playerResourceCount) return false;
    }
    return true;
  }
}
