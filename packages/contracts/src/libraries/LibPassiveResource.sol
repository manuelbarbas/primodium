// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// components

import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID } from "components/RequiredPassiveResourceComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID } from "components/PassiveResourceProductionComponent.sol";

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
    RequiredPassiveResourceComponent requiredPassiveResourceComponent = RequiredPassiveResourceComponent(
      getAddressById(world.components(), RequiredPassiveResourceComponentID)
    );
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(
      getAddressById(world.components(), MaxStorageComponentID)
    );
    if (requiredPassiveResourceComponent.has(blockType)) {
      ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
      uint256[] memory resourceIDs = requiredPassiveResourceComponent.getValue(blockType).ResourceIDs;
      uint32[] memory requiredAmounts = requiredPassiveResourceComponent.getValue(blockType).RequiredAmounts;
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
    RequiredPassiveResourceComponent requiredPassiveResourceComponent = RequiredPassiveResourceComponent(
      getAddressById(world.components(), RequiredPassiveResourceComponentID)
    );
    if (requiredPassiveResourceComponent.has(blockType)) {
      ItemComponent itemComponent = ItemComponent(getAddressById(world.components(), ItemComponentID));
      uint256[] memory resourceIDs = requiredPassiveResourceComponent.getValue(blockType).ResourceIDs;
      uint32[] memory requiredAmounts = requiredPassiveResourceComponent.getValue(blockType).RequiredAmounts;

      for (uint256 i = 0; i < resourceIDs.length; i++) {
        uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
        itemComponent.set(
          playerResourceEntity,
          LibMath.getSafeUint32Value(itemComponent, playerResourceEntity) + requiredAmounts[i]
        );
      }
    }
  }

  function updatePassiveResourceProduction(IWorld world, uint256 playerEntity, uint256 blockType) internal {
    PassiveResourceProductionComponent passiveResourceProductionComponent = PassiveResourceProductionComponent(
      getAddressById(world.components(), PassiveResourceProductionComponentID)
    );
    if (passiveResourceProductionComponent.has(blockType)) {
      MaxStorageComponent maxStorageComponent = MaxStorageComponent(
        getAddressById(world.components(), MaxStorageComponentID)
      );
      uint256 resourceId = passiveResourceProductionComponent.getValue(blockType).ResourceID;
      LibStorageUpdate.updateMaxStorageOfResourceForEntity(
        OwnedResourcesComponent(getAddressById(world.components(), OwnedResourcesComponentID)),
        maxStorageComponent,
        playerEntity,
        resourceId,
        LibMath.getSafeUint32Value(maxStorageComponent, LibEncode.hashKeyEntity(resourceId, playerEntity)) +
          passiveResourceProductionComponent.getValue(blockType).ResourceProduction
      );
    }
  }
}
