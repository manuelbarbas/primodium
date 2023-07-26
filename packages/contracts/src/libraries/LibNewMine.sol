// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { BoolComponent } from "std-contracts/components/BoolComponent.sol";
import { Uint256ArrayComponent } from "std-contracts/components/Uint256ArrayComponent.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "components/UnclaimedResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";

import { LibEncode } from "./LibEncode.sol";
import { LibUnclaimedResource } from "./LibUnclaimedResource.sol";
import { LibClaim } from "./LibClaim.sol";
import { LibMath } from "./LibMath.sol";

library LibNewMine {
  function claimResourcesFromMines(IWorld world, uint256 playerEntity) internal {
    OwnedResourcesComponent ownedResourcesComponent = OwnedResourcesComponent(
      world.getComponent(OwnedResourcesComponentID)
    );
    if (!ownedResourcesComponent.has(playerEntity)) return;
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    UnclaimedResourceComponent unclaimedResourceComponent = UnclaimedResourceComponent(
      world.getComponent(UnclaimedResourceComponentID)
    );
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(world.getComponent(MaxStorageComponentID));
    ItemComponent itemComponent = ItemComponent(world.getComponent(ItemComponentID));
    uint256[] memory storageResourceIds = ownedResourcesComponent.getValue(playerEntity);
    for (uint256 i = 0; i < storageResourceIds.length; i++) {
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(storageResourceIds[i], playerEntity);
      if (MineComponent(world.getComponent(MineComponentID)).has(playerResourceEntity))
        LibUnclaimedResource.updateUnclaimedForResource(world, playerEntity, storageResourceIds[i]);
      uint32 unclaimedResourceAmount = LibMath.getSafeUint32Value(unclaimedResourceComponent, playerResourceEntity);
      if (unclaimedResourceAmount > 0)
        LibClaim.addResourceToStorage(
          itemComponent,
          maxStorageComponent,
          storageResourceIds[i],
          unclaimedResourceAmount,
          playerEntity
        );
      lastClaimedAtComponent.set(playerResourceEntity, block.number);
      unclaimedResourceComponent.set(playerResourceEntity, 0);
    }
  }
}
