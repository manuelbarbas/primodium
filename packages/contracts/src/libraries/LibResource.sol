// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { getAddressById } from "solecs/utils.sol";

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { ProductionComponent, ID as ProductionComponentID } from "components/ProductionComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { ResourceValues } from "../types.sol";

import { ID as UpdateUnclaimedResourcesSystemID } from "../systems/S_UpdateUnclaimedResourcesSystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

library LibResource {
  //checks all required conditions for a factory to be functional and updates factory is functional status

  function hasRequiredResources(
    IWorld world,
    uint256 playerEntity,
    uint256 entity,
    uint32 count
  ) internal view returns (bool) {
    P_RequiredResourcesComponent requiredResourcesComponent = P_RequiredResourcesComponent(
      world.getComponent(P_RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    if (!requiredResourcesComponent.has(entity)) return true;

    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    ResourceValues memory requiredResources = requiredResourcesComponent.getValue(entity);
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

  function getTotalResources(
    IWorld world,
    uint256 playerEntity
  ) internal view returns (uint32 totalResources, uint32[] memory resources) {
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    P_MaxResourceStorageComponent maxResourceStorageComponent = P_MaxResourceStorageComponent(
      world.getComponent(P_MaxResourceStorageComponentID)
    );
    uint256[] memory storageResourceIds = maxResourceStorageComponent.getValue(playerEntity);
    resources = new uint32[](storageResourceIds.length);
    totalResources = 0;
    for (uint256 i = 0; i < storageResourceIds.length; i++) {
      uint256 resourceEntity = LibEncode.hashKeyEntity(storageResourceIds[i], playerEntity);
      resources[i] = LibMath.getSafe(itemComponent, resourceEntity);
      totalResources += resources[i];
    }
    return (totalResources, resources);
  }

  function claimAllResources(IWorld world, uint256 playerEntity) internal {
    P_MaxResourceStorageComponent maxResourceStorageComponent = P_MaxResourceStorageComponent(
      world.getComponent(P_MaxResourceStorageComponentID)
    );
    if (!maxResourceStorageComponent.has(playerEntity)) return;
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );

    uint256[] memory storageResourceIds = maxResourceStorageComponent.getValue(playerEntity);
    for (uint256 i = 0; i < storageResourceIds.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(storageResourceIds[i], playerEntity);
      if (ProductionComponent(world.getComponent(ProductionComponentID)).has(playerResourceEntity)) {
        IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
          msg.sender,
          storageResourceIds[i]
        );
      }
      lastClaimedAtComponent.set(playerResourceEntity, block.number);
    }
  }
}
