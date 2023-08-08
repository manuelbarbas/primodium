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

      if (getAvailableUtilityCapacity(world, playerEntity, resourceIDs[i]) < requiredAmount) {
        return false;
      }
    }
    return true;
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
}
