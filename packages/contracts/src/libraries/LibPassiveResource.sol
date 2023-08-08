// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// components

import { getAddressById } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

import { RequiredPassiveComponent, ID as RequiredPassiveComponentID } from "components/RequiredPassiveComponent.sol";
import { OccupiedPassiveResourceComponent, ID as OccupiedPassiveResourceComponentID } from "components/OccupiedPassiveResourceComponent.sol";
import { MaxPassiveComponent, ID as MaxPassiveComponentID } from "components/MaxPassiveComponent.sol";
// libraries

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

library LibPassiveResource {
  function checkPassiveResourceReqs(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType,
    uint32 buildingLevel
  ) internal view returns (bool) {
    RequiredPassiveComponent requiredPassiveComponent = RequiredPassiveComponent(
      getAddressById(world.components(), RequiredPassiveComponentID)
    );
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!requiredPassiveComponent.has(buildingLevelEntity)) return true;

    uint256[] memory resourceIDs = requiredPassiveComponent.getValue(buildingLevelEntity).resources;
    uint32[] memory requiredAmounts = requiredPassiveComponent.getValue(buildingLevelEntity).values;
    for (uint256 i = 0; i < resourceIDs.length; i++) {
      uint32 requiredAmount = requiredAmounts[i];
      if (buildingLevel > 1) {
        uint256 buildingPastLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel - 1);
        requiredAmount -= requiredPassiveComponent.getValue(buildingPastLevelEntity).values[i];
      }

      if (getAvailablePassiveCapacity(world, playerEntity, resourceIDs[i]) < requiredAmount) {
        return false;
      }
    }
    return true;
  }

  function getAvailablePassiveCapacity(
    IWorld world,
    uint256 playerEntity,
    uint256 resourceID
  ) internal view returns (uint32) {
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceID, playerEntity);
    return
      LibMath.getSafe(MaxPassiveComponent(world.getComponent(MaxPassiveComponentID)), playerResourceEntity) -
      LibMath.getSafe(
        OccupiedPassiveResourceComponent(world.getComponent(OccupiedPassiveResourceComponentID)),
        playerResourceEntity
      );
  }
}
