// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "components/UnclaimedResourceComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibUnclaimedResource } from "./LibUnclaimedResource.sol";
import { LibStorage } from "./LibStorage.sol";
import { ResourceValue, ResourceValues } from "../types.sol";

library LibResource {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function updateResourceProduction(IWorld world, uint256 entity, uint32 newResourceProductionRate) internal {
    MineProductionComponent mineProductionComponent = MineProductionComponent(
      world.getComponent(MineProductionComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    if (newResourceProductionRate == 0) {
      lastClaimedAtComponent.remove(entity);
      mineProductionComponent.remove(entity);
      return;
    }
    if (!lastClaimedAtComponent.has(entity)) lastClaimedAtComponent.set(entity, block.number);
    mineProductionComponent.set(entity, newResourceProductionRate);
  }

  function hasRequiredResources(IWorld world, uint256 entity, uint256 playerEntity) internal view returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      world.getComponent(RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    if (!requiredResourcesComponent.has(entity)) return true;

    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      uint32 resourceCost = LibMath.getSafe(
        itemComponent,
        LibEncode.hashKeyEntity(requiredResources.values[i], entity)
      );
      uint32 playerResourceCount = LibMath.getSafe(
        itemComponent,
        LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity)
      );
      if (resourceCost > playerResourceCount) return false;
    }
    return true;
  }

  function checkAndSpendRequiredResources(IWorld world, uint256 entity, uint256 playerEntity) internal returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      world.getComponent(RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    if (!requiredResourcesComponent.has(entity)) return true;

    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(entity);
    uint32[] memory currentResources = new uint32[](requiredResources.resources.length);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      currentResources[i] = LibMath.getSafe(
        itemComponent,
        LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity)
      );
      if (requiredResources.values[i] > currentResources[i]) {
        for (uint256 j = 0; j < i; j++) {
          itemComponent.set(LibEncode.hashKeyEntity(requiredResources.resources[j], playerEntity), currentResources[j]);
        }
        return false;
      }
      itemComponent.set(
        LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity),
        currentResources[i] - requiredResources.values[i]
      );
    }
    return true;
  }

  function spendRequiredResources(IWorld world, uint256 entity, uint256 playerEntity) internal {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      world.getComponent(RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    if (!requiredResourcesComponent.has(entity)) return;
    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(entity);
    for (uint256 i = 0; i < requiredResources.resources.length; i++) {
      uint256 playerResourceHash = LibEncode.hashKeyEntity(requiredResources.resources[i], playerEntity);
      uint32 currItem = LibMath.getSafe(itemComponent, playerResourceHash);
      itemComponent.set(playerResourceHash, currItem - requiredResources.values[i]);
    }
  }

  function claimMineResources(IWorld world, uint256 playerEntity) internal {
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      world.getComponent(MaxResourceStorageComponentID)
    );
    if (!maxResourceStorageComponent.has(playerEntity)) return;
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    UnclaimedResourceComponent unclaimedResourceComponent = UnclaimedResourceComponent(
      world.getComponent(UnclaimedResourceComponentID)
    );
    uint256[] memory storageResourceIds = maxResourceStorageComponent.getValue(playerEntity);
    for (uint256 i = 0; i < storageResourceIds.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(storageResourceIds[i], playerEntity);
      if (MineProductionComponent(world.getComponent(MineProductionComponentID)).has(playerResourceEntity))
        LibUnclaimedResource.updateResourceClaimed(world, playerEntity, storageResourceIds[i]);
      uint32 unclaimedResourceAmount = LibMath.getSafe(unclaimedResourceComponent, playerResourceEntity);
      if (unclaimedResourceAmount > 0)
        LibStorage.addResourceToStorage(world, storageResourceIds[i], unclaimedResourceAmount, playerEntity);
      lastClaimedAtComponent.set(playerResourceEntity, block.number);
      unclaimedResourceComponent.set(playerResourceEntity, 0);
    }
  }
}
