// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { EResource } from "src/Types.sol";
import { BattleRaidResult, BattleRaidResultData, P_Transportables, IsFleet, MaxResourceCount, NewBattleResult, NewBattleResultData, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";
import { LibSpaceRockAttributes } from "libraries/LibSpaceRockAttributes.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetRaid {
  function getMaxRaidAmountWithAllies(bytes32 entity) internal view returns (uint256[] memory, uint256) {
    return
      IsFleet.get(entity)
        ? LibFleetAttributes.getFreeCargoSpaceWithFollowers(entity)
        : LibSpaceRockAttributes.getFreeCargoSpaceWithDefenders(entity);
  }

  function getTotalRaidableResourceCountsWithAllies(bytes32 entity) internal view returns (uint256[] memory, uint256) {
    return
      IsFleet.get(entity)
        ? LibFleetAttributes.getResourceCountsWithFollowers(entity)
        : LibSpaceRockAttributes.getTotalStoredResourceCountsWithDefenders(entity);
  }

  function getAllies(bytes32 entity) internal view returns (bytes32[] memory) {
    return IsFleet.get(entity) ? LibFleetStance.getFollowerFleets(entity) : LibFleetStance.getDefendingFleets(entity);
  }

  function resolveBattleRaid(
    bytes32 battleId,
    bytes32 raider,
    bytes32 target
  ) internal {
    //maximum amount of resources the fleet can raid
    (uint256[] memory freeCargoSpaces, uint256 maxRaidAmount) = getMaxRaidAmountWithAllies(raider);
    //total raidable resources the target fleet/space rock and their allies have

    //toal resources that were raided (some potential rounding down errors occur when accounting for portion of resources raided from each resource of each fleet which result in totalRaidedResources not being equal to maxRaidAmount)

    // will caculate how much of each resource was successfuly raided from target and increase those to be used for increasing resources
    (uint256[] memory totalRaidedResourceCounts, uint256 totalRaidedResources) = calculateRaidFromWithAllies(
      battleId,
      target,
      maxRaidAmount
    );

    //will increase the resources that were successfully raided to the raider and their allies
    receiveRaidedResourcesWithAllies(
      battleId,
      raider,
      freeCargoSpaces,
      maxRaidAmount,
      totalRaidedResourceCounts,
      totalRaidedResources
    );
  }

  function calculateRaidFromWithAllies(
    bytes32 battleId,
    bytes32 targetEntity,
    uint256 maxRaidAmount
  ) internal returns (uint256[] memory totalRaidedResourceCounts, uint256 totalRaidedResources) {
    (
      uint256[] memory totalRaidableResourceCounts,
      uint256 totalRaidableResources
    ) = getTotalRaidableResourceCountsWithAllies(targetEntity);

    //if the fleet can raid more than the total resources available, raid all resources
    if (maxRaidAmount > totalRaidableResources) maxRaidAmount = totalRaidableResources;

    totalRaidedResourceCounts = new uint256[](P_Transportables.get().length);

    (totalRaidedResourceCounts, totalRaidedResources) = calculateRaidFrom(
      battleId,
      targetEntity,
      totalRaidableResourceCounts,
      totalRaidableResources,
      maxRaidAmount,
      totalRaidedResourceCounts,
      totalRaidedResources
    );

    bytes32[] memory allies = getAllies(targetEntity);
    for (uint256 i = 0; i < allies.length; i++) {
      (totalRaidedResourceCounts, totalRaidedResources) = calculateRaidFrom(
        battleId,
        allies[i],
        totalRaidableResourceCounts,
        totalRaidableResources,
        maxRaidAmount,
        totalRaidedResourceCounts,
        totalRaidedResources
      );
    }
  }

  function calculateRaidFrom(
    bytes32 battleId,
    bytes32 targetEntity,
    uint256[] memory totalRaidableResourceCounts,
    uint256 totalRaidableResources,
    uint256 maxRaidAmount,
    uint256[] memory totalRaidedResourceCounts,
    uint256 totalRaidedResources
  ) internal returns (uint256[] memory, uint256) {
    uint8[] memory transportables = P_Transportables.get();
    BattleRaidResultData memory raidResult = BattleRaidResultData({
      resourcesAtStart: new uint256[](transportables.length),
      resourcesAtEnd: new uint256[](transportables.length)
    });
    for (uint256 i = 0; i < transportables.length; i++) {
      raidResult.resourcesAtStart[i] = ResourceCount.get(targetEntity, transportables[i]);
      if (raidResult.resourcesAtStart[i] == 0) continue;
      uint256 resourcePortion = ((raidResult.resourcesAtStart[i] * maxRaidAmount) / totalRaidableResources);

      if (IsFleet.get(targetEntity)) {
        LibFleet.decreaseFleetResource(targetEntity, transportables[i], resourcePortion);
      } else {
        LibStorage.decreaseStoredResource(targetEntity, transportables[i], resourcePortion);
      }
      raidResult.resourcesAtEnd[i] = ResourceCount.get(targetEntity, transportables[i]);
      totalRaidedResourceCounts[i] += resourcePortion;
      totalRaidedResources += resourcePortion;
    }
    BattleRaidResult.set(battleId, targetEntity, raidResult);
    return (totalRaidedResourceCounts, totalRaidedResources);
  }

  function receiveRaidedResourcesWithAllies(
    bytes32 battleId,
    bytes32 targetEntity,
    uint256[] memory freeCargoSpaces,
    uint256 maxRaidAmount,
    uint256[] memory totalRaidedResourceCounts,
    uint256 totalRaidedResources
  ) internal {
    receiveRaidedResources(
      battleId,
      targetEntity,
      maxRaidAmount,
      freeCargoSpaces[0],
      totalRaidedResourceCounts,
      totalRaidedResources
    );

    bytes32[] memory allies = getAllies(targetEntity);

    for (uint256 i = 0; i < allies.length; i++) {
      receiveRaidedResources(
        battleId,
        allies[i],
        maxRaidAmount,
        freeCargoSpaces[i + 1],
        totalRaidedResourceCounts,
        totalRaidedResources
      );
    }
  }

  function receiveRaidedResources(
    bytes32 battleId,
    bytes32 targetEntity,
    uint256 maxRaidAmount,
    uint256 freeCargoSpace,
    uint256[] memory totalRaidedResourceCounts,
    uint256 totalRaidedResources
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    BattleRaidResultData memory raidResult = BattleRaidResultData({
      resourcesAtStart: new uint256[](transportables.length),
      resourcesAtEnd: new uint256[](transportables.length)
    });
    for (uint256 i = 0; i < transportables.length; i++) {
      if (totalRaidedResourceCounts[i] == 0) continue;
      uint256 resourcePortion = (totalRaidedResourceCounts[i] * freeCargoSpace) /
        (totalRaidedResources * maxRaidAmount);
      raidResult.resourcesAtStart[i] = ResourceCount.get(targetEntity, transportables[i]);
      if (IsFleet.get(targetEntity)) {
        LibFleet.increaseFleetResource(targetEntity, transportables[i], resourcePortion);
      } else {
        LibStorage.increaseStoredResource(targetEntity, transportables[i], resourcePortion);
      }
      raidResult.resourcesAtEnd[i] = ResourceCount.get(targetEntity, transportables[i]);
    }
    BattleRaidResult.set(battleId, targetEntity, raidResult);
  }
}
