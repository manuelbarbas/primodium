// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// Production Buildings
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "../components/UnclaimedResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "../components/LastClaimedAtComponent.sol";
import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "../components/PlayerProductionComponent.sol";

import { LibEncode } from "./LibEncode.sol";
import { LibMath } from "./LibMath.sol";
import { LibStorage } from "./LibStorage.sol";

library LibUnclaimedResource {
  function updateResourceClaimed(IWorld world, uint256 playerEntity, uint256 resourceId) internal {
    UnclaimedResourceComponent unclaimedResourceComponent = UnclaimedResourceComponent(
      world.getComponent(UnclaimedResourceComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    PlayerProductionComponent playerProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
    );

    uint256 playerResourceProductionEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    if (!lastClaimedAtComponent.has(playerResourceProductionEntity)) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    } else if (lastClaimedAtComponent.getValue(playerResourceProductionEntity) == block.number) {
      return;
    }
    uint32 playerResourceProduction = LibMath.getSafe(playerProductionComponent, playerResourceProductionEntity);
    if (playerResourceProduction <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }

    uint32 availableSpaceInStorage = LibStorage.getResourceStorageSpace(world, playerEntity, resourceId);
    if (availableSpaceInStorage <= 0) {
      lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
      return;
    }

    uint32 unclaimedResource = LibMath.getSafe(unclaimedResourceComponent, playerResourceProductionEntity) +
      (playerResourceProduction *
        uint32(block.number - LibMath.getSafe(lastClaimedAtComponent, playerResourceProductionEntity)));

    if (availableSpaceInStorage < unclaimedResource) {
      unclaimedResource = availableSpaceInStorage;
    }
    lastClaimedAtComponent.set(playerResourceProductionEntity, block.number);
    unclaimedResourceComponent.set(playerResourceProductionEntity, unclaimedResource);
  }
}
