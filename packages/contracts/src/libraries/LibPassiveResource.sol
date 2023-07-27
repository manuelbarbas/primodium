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
import { LibStorageUpdate } from "../libraries/LibStorageUpdate.sol";

library LibPassiveResource {
  function checkPassiveResourceRequirements(
    IWorld world,
    uint256 playerEntity,
    uint256 blockType
  ) internal view returns (bool) {
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      getAddressById(world.components(), RequiredPassiveComponentID)
    );
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(
      getAddressById(world.components(), MaxStorageComponentID)
    );
    if (requiredPassiveComponent.has(blockType)) {
      ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
      uint256[] memory resourceIDs = requiredPassiveComponent.getValue(blockType).ResourceIDs;
      uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(blockType).RequiredAmounts;
      for (uint256 i = 0; i < resourceIDs.length; i++) {
        if (
          LibStorage.getAvailableSpaceInStorageForResource(
            maxStorageComponent,
            itemComponent,
            playerEntity,
            resourceIDs[i]
          ) < requiredAmounts[i]
        ) {
          return false;
        }
      }
    }
    return true;
  }

  function updatePassiveResourcesBasedOnRequirements(IWorld world, uint256 playerEntity, uint256 blockType) internal {
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      getAddressById(world.components(), RequiredPassiveComponentID)
    );
    if (requiredPassiveComponent.has(blockType)) {
      ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
      uint256[] memory resourceIDs = requiredPassiveComponent.getValue(blockType).ResourceIDs;
      uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(blockType).RequiredAmounts;

      for (uint256 i = 0; i < resourceIDs.length; i++) {
        uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
        itemComponent.set(
          playerResourceEntity,
          LibMath.getSafeUint32Value(itemComponent, playerResourceEntity) + requiredAmounts[i]
        );
      }
    }
  }

  function updatePassiveProduction(IWorld world, uint256 playerEntity, uint256 blockType) internal {
    PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
      getAddressById(world.components(), PassiveProductionComponentID)
    );
    if (passiveProductionComponent.has(blockType)) {
      MaxStorageComponent maxStorageComponent = MaxStorageComponent(
        getAddressById(world.components(), MaxStorageComponentID)
      );
      uint256 resourceId = passiveProductionComponent.getValue(blockType).ResourceID;
      LibStorageUpdate.updateMaxStorageOfResourceForEntity(
        MaxResourceStorageComponent(getAddressById(world.components(), MaxResourceStorageComponentID)),
        maxStorageComponent,
        playerEntity,
        resourceId,
        LibMath.getSafeUint32Value(maxStorageComponent, LibEncode.hashKeyEntity(resourceId, playerEntity)) +
          passiveProductionComponent.getValue(blockType).ResourceProduction
      );
    }
  }
}
