// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";
// tables
import { P_ResourceReward, P_ResourceRewardData, P_UnitReward, P_UnitRewardData, P_RequiredObjectives, CompletedObjective, P_EnumToPrototype, P_MaxLevel, Home, P_RequiredTile, P_ProducesUnits, P_RequiredBaseLevel, P_Terrain, P_AsteroidData, P_Asteroid, Spawned, DimensionsData, Dimensions, PositionData, Level, BuildingType, Position, LastClaimedAt, Children, OwnedBy, P_Blueprint, Children } from "codegen/index.sol";

// libraries
import { LibEncode } from "libraries/LibEncode.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { UnitFactorySet } from "libraries/UnitFactorySet.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

// types
import { UnitKey, BuildingKey, BuildingTileKey, ExpansionKey } from "src/Keys.sol";
import { Bounds, EBuilding, EResource } from "src/Types.sol";

import { MainBasePrototypeId } from "codegen/Prototypes.sol";

library LibReward {
  function receiveRewards(bytes32 playerEntity, bytes32 prototype) internal {
    receiveUnitRewards(playerEntity, prototype);
  }

  function receiveUnitRewards(bytes32 playerEntity, bytes32 prototype) internal {
    bytes32 homeAsteroid = Home.get(playerEntity).asteroid;
    P_UnitRewardData memory rewardData = P_UnitReward.get(prototype);
    for (uint256 i = 0; i < rewardData.unitTypes.length; i++) {
      bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, uint8(rewardData.unitTypes[i]));
      LibUnit.updateStoredUtilities(playerEntity, unitPrototype, rewardData.amounts[i], true);
      LibUnit.increaseUnitCount(playerEntity, homeAsteroid, unitPrototype, rewardData.amounts[i]);
    }
  }

  function receiveResourceRewards(bytes32 playerEntity, bytes32 prototype) internal {
    bytes32 homeAsteroid = Home.get(playerEntity).asteroid;
    P_ResourceRewardData memory rewardData = P_ResourceReward.get(prototype);
    for (uint256 i = 0; i < rewardData.resources.length; i++) {
      LibStorage.increaseStoredResource(playerEntity, rewardData.resources[i], rewardData.amounts[i]);
    }
  }
}
