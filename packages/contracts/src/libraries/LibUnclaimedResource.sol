// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "../components/UnclaimedResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "../components/LastClaimedAtComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "../components/StorageCapacityComponent.sol";
import { MineComponent, ID as MineComponentID } from "../components/MineComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "../components/ItemComponent.sol";

import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibStorage } from "./LibStorage.sol";

library LibUnclaimedResource {
  function updateUnclaimedForResource(IWorld world, uint256 playerEntity, uint256 resourceId) internal {
    UnclaimedResourceComponent unclaimedResourceComponent = UnclaimedResourceComponent(
      world.getComponent(UnclaimedResourceComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    StorageCapacityComponent storageComponent = StorageCapacityComponent(
      world.getComponent(StorageCapacityComponentID)
    );
    MineComponent mineComponent = MineComponent(world.getComponent(MineComponentID));
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    uint256 playerResourceProductionEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    if (!lastClaimedAtComponent.has(playerResourceProductionEntity)) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    } else if (lastClaimedAtComponent.getValue(playerResourceProductionEntity) == block.number) {
      return;
    }
    uint256 playerResourceProduction = LibMath.getSafeUint256Value(mineComponent, playerResourceProductionEntity);
    if (playerResourceProduction <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }

    uint256 availableSpaceInStorage = LibStorage.getAvailableSpaceInStorageForResource(
      storageComponent,
      itemComponent,
      playerEntity,
      resourceId
    );
    if (availableSpaceInStorage <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }

    uint256 unclaimedResource = LibMath.getSafeUint256Value(
      unclaimedResourceComponent,
      playerResourceProductionEntity
    ) +
      (playerResourceProduction *
        (block.number - LibMath.getSafeUint256Value(lastClaimedAtComponent, playerResourceProductionEntity)));

    if (availableSpaceInStorage < unclaimedResource) {
      unclaimedResource = availableSpaceInStorage;
    }
    lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
    unclaimedResourceComponent.set(playerResourceProductionEntity, unclaimedResource);
  }
}
