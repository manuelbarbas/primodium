// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// components

import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { RequiredPassiveComponent, ID as RequiredPassiveComponentID } from "components/RequiredPassiveComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID } from "components/PassiveProductionComponent.sol";

// libraries

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";

library LibPassiveResource {
  function checkPassiveResourceRequirements(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType
  ) internal view returns (bool) {
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      getAddressById(world.components(), RequiredPassiveComponentID)
    );

    if (!requiredPassiveComponent.has(buildingType)) return true;

    uint256[] memory resourceIDs = requiredPassiveComponent.getValue(buildingType).resources;
    uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(buildingType).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      if (LibStorage.getResourceStorageSpace(world, playerEntity, resourceIDs[i]) < requiredAmounts[i]) {
        return false;
      }
    }
    return true;
  }

  function updatePassiveResources(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType,
    uint32 buildingLevel
  ) internal {
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      world.getComponent(RequiredPassiveComponentID)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!requiredPassiveComponent.has(buildingLevelEntity)) return;

    ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
    uint256[] memory resourceIDs = requiredPassiveComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(buildingLevelEntity).values;

    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
      itemComponent.set(
        playerResourceEntity,
        LibMath.getSafeUint32Value(itemComponent, playerResourceEntity) + requiredAmounts[i]
      );
    }
  }

  function updatePassiveProduction(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType,
    uint32 buildingLevel
  ) internal {
    PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
      getAddressById(world.components(), PassiveProductionComponentID)
    );

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!passiveProductionComponent.has(buildingLevelEntity)) return;

    uint256 resourceId = passiveProductionComponent.getValue(buildingLevelEntity).resource;
    uint32 newMaxStorage = LibMath.getSafeUint32Value(
      MaxStorageComponent(world.getComponent(MaxStorageComponentID)),
      LibEncode.hashKeyEntity(resourceId, playerEntity)
    ) + passiveProductionComponent.getValue(buildingLevelEntity).value;

    LibStorage.updateResourceMaxStorage(world, playerEntity, resourceId, newMaxStorage);
  }
}
