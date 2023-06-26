// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { entityToAddress, addressToEntity } from "solecs/utils.sol";

import { LibMath } from "./LibMath.sol";
import { LibEncode } from "./LibEncode.sol";

import { BasicMinerID, NodeID, PlatingFactoryID, BasicBatteryFactoryID, KineticMissileFactoryID, ProjectileLauncherID, HardenedDrillID, DenseMetalRefineryID, AdvancedBatteryFactoryID, HighTempFoundryID, PrecisionMachineryFactoryID, IridiumDrillbitFactoryID, PrecisionPneumaticDrillID, PenetratorFactoryID, PenetratingMissileFactoryID, MissileLaunchComplexID, HighEnergyLaserFactoryID, ThermobaricWarheadFactoryID, ThermobaricMissileFactoryID, KimberliteCatalystFactoryID } from "../prototypes/Tiles.sol";

library LibResourceCost {
  function hasRequiredResources(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 playerEntity
  ) internal view returns (bool) {
    if (!requiredResourcesComponent.has(entity)) return true;

    uint256[] memory requiredResources = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < requiredResources.length; i++) {
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromKey(requiredResources[i], entity)
      );
      if (
        resourceCost >
        LibMath.getSafeUint256Value(itemComponent, LibEncode.hashKeyEntity(requiredResources[i], playerEntity))
      ) return false;
    }
    return true;
  }

  function checkAndSpendRequiredResources(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 playerEntity
  ) internal returns (bool) {
    if (!requiredResourcesComponent.has(entity)) return true;

    uint256[] memory requiredResourceIds = requiredResourcesComponent.getValue(entity);
    uint256[] memory requiredResources = new uint256[](requiredResourceIds.length);
    uint256[] memory currentResources = new uint256[](requiredResourceIds.length);
    for (uint256 i = 0; i < requiredResourceIds.length; i++) {
      requiredResources[i] = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromKey(requiredResourceIds[i], entity)
      );
      currentResources[i] = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashKeyEntity(requiredResourceIds[i], playerEntity)
      );
      if (requiredResources[i] > currentResources[i]) {
        for (uint256 j = 0; j < i; j++) {
          itemComponent.set(LibEncode.hashKeyEntity(requiredResourceIds[j], playerEntity), currentResources[j]);
        }
        return false;
      }
      itemComponent.set(
        LibEncode.hashKeyEntity(requiredResourceIds[i], playerEntity),
        currentResources[i] - requiredResources[i]
      );
    }
    return true;
  }

  function spendRequiredResources(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 playerEntity
  ) internal {
    if (!requiredResourcesComponent.has(entity)) return;
    uint256[] memory requiredResources = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < requiredResources.length; i++) {
      uint256 playerResourceHash = LibEncode.hashKeyEntity(requiredResources[i], playerEntity);
      uint256 resourceCost = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashFromKey(requiredResources[i], entity)
      );
      uint256 curItem = LibMath.getSafeUint256Value(itemComponent, playerResourceHash);
      itemComponent.set(playerResourceHash, curItem - resourceCost);
    }
  }

  function set1RequiredResourceForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1
  ) internal {
    uint256[] memory resourceIds = new uint256[](1);
    resourceIds[0] = resourceId1;
    requiredResourcesComponent.set(entity, resourceIds);
    itemComponent.set(LibEncode.hashFromKey(resourceId1, entity), resourceCost1);
  }

  function set2RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2
  ) internal {
    uint256[] memory resourceIds = new uint256[](2);
    resourceIds[0] = resourceId1;
    resourceIds[1] = resourceId2;
    requiredResourcesComponent.set(entity, resourceIds);
    itemComponent.set(LibEncode.hashFromKey(resourceId1, entity), resourceCost1);
    itemComponent.set(LibEncode.hashFromKey(resourceId2, entity), resourceCost2);
  }

  function set3RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 resourceId3,
    uint256 resourceCost3
  ) internal {
    uint256[] memory resourceIds = new uint256[](3);
    resourceIds[0] = resourceId1;
    resourceIds[1] = resourceId2;
    resourceIds[2] = resourceId3;
    requiredResourcesComponent.set(entity, resourceIds);
    itemComponent.set(LibEncode.hashFromKey(resourceId1, entity), resourceCost1);
    itemComponent.set(LibEncode.hashFromKey(resourceId2, entity), resourceCost2);
    itemComponent.set(LibEncode.hashFromKey(resourceId3, entity), resourceCost3);
  }

  function set4RequiredResourcesForEntity(
    Uint256ArrayComponent requiredResourcesComponent,
    Uint256Component itemComponent,
    uint256 entity,
    uint256 resourceId1,
    uint256 resourceCost1,
    uint256 resourceId2,
    uint256 resourceCost2,
    uint256 resourceId3,
    uint256 resourceCost3,
    uint256 resourceId4,
    uint256 resourceCost4
  ) internal {
    uint256[] memory resourceIds = new uint256[](4);
    resourceIds[0] = resourceId1;
    resourceIds[1] = resourceId2;
    resourceIds[2] = resourceId3;
    resourceIds[3] = resourceId4;
    requiredResourcesComponent.set(entity, resourceIds);
    itemComponent.set(LibEncode.hashFromKey(resourceId1, entity), resourceCost1);
    itemComponent.set(LibEncode.hashFromKey(resourceId2, entity), resourceCost2);
    itemComponent.set(LibEncode.hashFromKey(resourceId3, entity), resourceCost3);
    itemComponent.set(LibEncode.hashFromKey(resourceId4, entity), resourceCost4);
  }
}
