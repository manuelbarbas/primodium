// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// components

import { getAddressById } from "solecs/utils.sol";
import { IWorld } from "solecs/System.sol";

import { P_BuildingDefenceComponent, ID as P_BuildingDefenceComponentID } from "components/P_BuildingDefenceComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { OccupiedUtilityResourceComponent, ID as OccupiedUtilityResourceComponentID } from "components/OccupiedUtilityResourceComponent.sol";
import { MaxUtilityComponent, ID as MaxUtilityComponentID } from "components/MaxUtilityComponent.sol";
// libraries

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUpdateSpaceRock } from "../libraries/LibUpdateSpaceRock.sol";
import { EActionType } from "../types.sol";

library LibDefence {
  function updateBuildingDefence(
    IWorld world,
    uint256 playerEntity,
    uint256 buildingType,
    uint32 buildingLevel,
    EActionType actionType
  ) internal {
    P_BuildingDefenceComponent buildingDefenceComponent = P_BuildingDefenceComponent(
      getAddressById(world.components(), P_BuildingDefenceComponentID)
    );

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    if (!buildingDefenceComponent.has(buildingLevelEntity)) return; // building has no defence

    uint32 capacityIncrease = buildingDefenceComponent.getValue(buildingLevelEntity);

    if (actionType == EActionType.Upgrade) {
      uint256 buildingLastLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel - 1);
      if (buildingDefenceComponent.has(buildingLastLevelEntity))
        capacityIncrease = capacityIncrease - buildingDefenceComponent.getValue(buildingLastLevelEntity);
    }

    modifyAsteroidDefence(world, playerEntity, capacityIncrease, actionType != EActionType.Destroy);
  }

  function modifyAsteroidDefence(
    IWorld world,
    uint256 playerEntity,
    uint32 amount,
    bool isAdd
  ) internal {
    uint256 asteroidEntity = LibUpdateSpaceRock.getPlayerAsteroidEntity(world, playerEntity);
    P_BuildingDefenceComponent buildingDefenceComponent = P_BuildingDefenceComponent(
      getAddressById(world.components(), P_BuildingDefenceComponentID)
    );

    uint32 currValue = LibMath.getSafe(buildingDefenceComponent, asteroidEntity);
    if (isAdd) {
      buildingDefenceComponent.set(asteroidEntity, currValue + amount);
      return;
    } else {
      if (currValue < amount) buildingDefenceComponent.set(asteroidEntity, 0);
      else buildingDefenceComponent.set(asteroidEntity, currValue - amount);
    }
    return;
  }
}
