// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { getAddressById, entityToAddress } from "solecs/utils.sol";

import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { P_ResourceRewardComponent, ID as P_ResourceRewardComponentID } from "components/P_ResourceRewardComponent.sol";
import { P_UnitRewardComponent, ID as P_UnitRewardComponentID } from "components/P_UnitRewardComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { IWorld } from "solecs/interfaces/IWorld.sol";
import { LibEncode } from "./LibEncode.sol";

import { LibStorage } from "./LibStorage.sol";
import { LibUpdateSpaceRock } from "./LibUpdateSpaceRock.sol";
import { ResourceValues } from "../types.sol";

import { LibUpdateSpaceRock } from "./LibUpdateSpaceRock.sol";
import { LibResource } from "./LibResource.sol";
import { LibUtilityResource } from "./LibUtilityResource.sol";
import { LibUnits } from "./LibUnits.sol";

library LibReward {
  //checks all required conditions for a factory to be functional and updates factory is functional status
  function canReceiveResourceRewards(
    IWorld world,
    uint256 playerEntity,
    uint256 objectiveEntity
  ) internal view returns (bool) {
    P_ResourceRewardComponent resourceRewardComponent = P_ResourceRewardComponent(
      getAddressById(world.components(), P_ResourceRewardComponentID)
    );

    if (!resourceRewardComponent.has(objectiveEntity)) return true;

    ResourceValues memory rewardResourceValues = resourceRewardComponent.getValue(objectiveEntity);
    for (uint256 i = 0; i < rewardResourceValues.resources.length; i++) {
      uint256 resourceEntity = LibEncode.hashKeyEntity(rewardResourceValues.resources[i], playerEntity);
      if (
        LibStorage.getResourceStorageSpace(world, playerEntity, rewardResourceValues.resources[i]) <
        rewardResourceValues.values[i]
      ) return false;
    }

    return true;
  }

  function canReceiveUnitRewards(
    IWorld world,
    uint256 playerEntity,
    uint256 objectiveEntity
  ) internal view returns (bool) {
    P_UnitRewardComponent unitRewardComponent = P_UnitRewardComponent(
      getAddressById(world.components(), P_UnitRewardComponentID)
    );

    if (!unitRewardComponent.has(objectiveEntity)) return true;

    ResourceValues memory rewardUnitValues = unitRewardComponent.getValue(objectiveEntity);
    for (uint256 i = 0; i < rewardUnitValues.resources.length; i++) {
      if (
        !LibUtilityResource.checkUtilityResourceReqs(
          world,
          playerEntity,
          rewardUnitValues.resources[i],
          rewardUnitValues.values[i]
        )
      ) return false;
    }

    return true;
  }

  function canReceiveRewards(IWorld world, uint256 playerEntity, uint256 objectiveEntity) internal view returns (bool) {
    return
      canReceiveResourceRewards(world, playerEntity, objectiveEntity) &&
      canReceiveUnitRewards(world, playerEntity, objectiveEntity);
  }

  function receiveRewards(IWorld world, uint256 playerEntity, uint256 objectiveEntity) internal {
    receiveResourceRewards(world, playerEntity, objectiveEntity);
    receiveUnitRewards(world, playerEntity, objectiveEntity);
  }

  function receiveResourceRewards(IWorld world, uint256 playerEntity, uint256 objectiveEntity) internal {
    P_ResourceRewardComponent resourceRewardComponent = P_ResourceRewardComponent(
      getAddressById(world.components(), P_ResourceRewardComponentID)
    );

    if (!resourceRewardComponent.has(objectiveEntity)) return;
    ResourceValues memory rewardResourceValues = resourceRewardComponent.getValue(objectiveEntity);
    for (uint256 i = 0; i < rewardResourceValues.resources.length; i++) {
      LibStorage.addResourceToStorage(
        world,
        playerEntity,
        rewardResourceValues.resources[i],
        rewardResourceValues.values[i]
      );
    }
  }

  function receiveUnitRewards(IWorld world, uint256 playerEntity, uint256 objectiveEntity) internal {
    P_UnitRewardComponent unitRewardComponent = P_UnitRewardComponent(
      getAddressById(world.components(), P_UnitRewardComponentID)
    );

    if (!unitRewardComponent.has(objectiveEntity)) return;
    ResourceValues memory rewardUnitValues = unitRewardComponent.getValue(objectiveEntity);
    for (uint256 i = 0; i < rewardUnitValues.resources.length; i++) {
      // update occupied utility
      LibUnits.updateOccuppiedUtilityResources(
        world,
        playerEntity,
        rewardUnitValues.resources[i],
        rewardUnitValues.values[i],
        true
      );
      LibUpdateSpaceRock.addPlayerUnitsToAsteroid(
        world,
        playerEntity,
        rewardUnitValues.resources[i],
        rewardUnitValues.values[i]
      );
    }
  }
}
