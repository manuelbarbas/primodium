// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "../components/UnclaimedResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "../components/LastClaimedAtComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "../components/MaxStorageComponent.sol";
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
    MaxStorageComponent storageComponent = MaxStorageComponent(world.getComponent(MaxStorageComponentID));
    MineComponent mineComponent = MineComponent(world.getComponent(MineComponentID));
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));

    uint256 playerResourceProductionEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    if (!lastClaimedAtComponent.has(playerResourceProductionEntity)) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    } else if (lastClaimedAtComponent.getValue(playerResourceProductionEntity) == block.number) {
      return;
    }
    uint32 playerResourceProduction = LibMath.getSafeUint32Value(mineComponent, playerResourceProductionEntity);
    if (playerResourceProduction <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }

    uint32 availableSpaceInStorage = LibStorage.getAvailableSpaceInStorageForResource(
      storageComponent,
      itemComponent,
      playerEntity,
      resourceId
    );
    if (availableSpaceInStorage <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }

    uint32 unclaimedResource = LibMath.getSafeUint32Value(unclaimedResourceComponent, playerResourceProductionEntity) +
      (playerResourceProduction *
        uint32(block.number - LibMath.getSafeUint256Value(lastClaimedAtComponent, playerResourceProductionEntity)));

    if (availableSpaceInStorage < unclaimedResource) {
      unclaimedResource = availableSpaceInStorage;
    }
    lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
    unclaimedResourceComponent.set(playerResourceProductionEntity, unclaimedResource);
  }
}
