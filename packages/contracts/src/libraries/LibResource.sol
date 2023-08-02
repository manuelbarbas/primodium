// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "components/PlayerProductionComponent.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "components/UnclaimedResourceComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID } from "components/BuildingProductionComponent.sol";
import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "components/PlayerProductionComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibUnclaimedResource } from "./LibUnclaimedResource.sol";
import { LibStorage } from "./LibStorage.sol";
import { ResourceValue, ResourceValues } from "../types.sol";

library LibResource {
  //checks all required conditions for a factory to be functional and updates factory is functional status
  function updateResourceProduction(IWorld world, uint256 buildingType, uint32 buildingLevel, bool isDestroy) internal {
    BuildingProductionComponent buildingProductionComponent = BuildingProductionComponent(
      world.getComponent(BuildingProductionComponentID)
    );
    PlayerProductionComponent playerProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
    );
  }

  function updateResourceProduction(IWorld world, uint256 entity, uint32 newResourceProductionRate) internal {
    PlayerProductionComponent mineProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
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
      if (PlayerProductionComponent(world.getComponent(PlayerProductionComponentID)).has(playerResourceEntity))
        LibUnclaimedResource.updateResourceClaimed(world, playerEntity, storageResourceIds[i]);
      uint32 unclaimedResourceAmount = LibMath.getSafe(unclaimedResourceComponent, playerResourceEntity);
      if (unclaimedResourceAmount > 0)
        LibStorage.addResourceToStorage(world, storageResourceIds[i], unclaimedResourceAmount, playerEntity);
      lastClaimedAtComponent.set(playerResourceEntity, block.number);
      unclaimedResourceComponent.set(playerResourceEntity, 0);
    }
  }
}
