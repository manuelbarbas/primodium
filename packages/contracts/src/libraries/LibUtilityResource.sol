// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// components

import { getAddressById } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "components/MaxUtilityComponent.sol";
// libraries

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

library LibUtilityResource {
  function checkUtilityResourceReqs(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType,
    uint32 buildingLevel
  ) internal view returns (bool) {
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      getAddressById(world.components(), P_RequiredUtilityComponentID)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!requiredUtilityComponent.has(buildingLevelEntity)) return true;

    uint256[] memory resourceIDs = requiredUtilityComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(buildingLevelEntity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint32 requiredAmount = requiredAmounts[i];
      if (buildingLevel > 1) {
        uint256 buildingPastLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel - 1);
        requiredAmount -= requiredUtilityComponent.getValue(buildingPastLevelEntity).values[i];
      }

      if (!checkRequiredUtility(world, playerEntity, resourceIDs[i], requiredAmount)) {
        return false;
      }
    }
    return true;
  }

  function checkRequiredUtility(
    IWorld world,
    uint256 playerEntity,
    uint256 resourceID,
    uint32 requiredAmount
  ) internal view returns (bool) {
    return getAvailableUtilityCapacity(world, playerEntity, resourceID) >= requiredAmount;
  }

  function checkMaxUtilityResourceReqs(IWorld world, uint256 playerEntity, uint256 entity) internal returns (bool) {
    P_RequiredUtilityComponent requiredUtilityComponent = P_RequiredUtilityComponent(
      getAddressById(world.components(), P_RequiredUtilityComponentID)
    );
    if (!requiredUtilityComponent.has(entity)) return true;

    uint256[] memory resourceIDs = requiredUtilityComponent.getValue(entity).resources;
    uint32[] memory requiredAmounts = requiredUtilityComponent.getValue(entity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      if (getMaxUtility(world, playerEntity, resourceIDs[i]) < requiredAmounts[i]) {
        return false;
      }
    }
    return true;
  }

  function getMaxUtility(IWorld world, uint256 playerEntity, uint256 resourceID) internal view returns (uint32) {
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceID, playerEntity);
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(world.getComponent(MaxUtilityComponentID));
    return LibMath.getSafe(maxUtilityComponent, playerResourceEntity);
  }

  function getAvailableUtilityCapacity(
    IWorld world,
    uint256 playerEntity,
    uint256 resourceID
  ) internal view returns (uint32) {
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceID, playerEntity);
    return
      LibMath.getSafe(MaxUtilityComponent(world.getComponent(MaxUtilityComponentID)), playerResourceEntity) -
      LibMath.getSafe(
        OccupiedUtilityResourceComponent(world.getComponent(OccupiedUtilityResourceComponentID)),
        playerResourceEntity
      );
  }

  function modifyMaxUtility(
    IWorld world,
    uint256 playerEntity,
    uint256 resourceId,
    uint32 amount,
    bool isAdd
  ) internal {
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    MaxUtilityComponent maxUtilityComponent = MaxUtilityComponent(world.getComponent(MaxUtilityComponentID));
    uint32 currValue = LibMath.getSafe(maxUtilityComponent, playerResourceEntity);
    if (isAdd) {
      maxUtilityComponent.set(playerResourceEntity, currValue + amount);
      return;
    } else {
      if (currValue < amount) maxUtilityComponent.set(playerResourceEntity, 0);
      else maxUtilityComponent.set(playerResourceEntity, currValue - amount);
    }
    return;
  }
}
