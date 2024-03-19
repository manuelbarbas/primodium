// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;
import { EResource } from "src/Types.sol";

import { RaidedResource, BattleRaidResult, BattleRaidResultData, P_Transportables, IsFleet, MaxResourceCount, BattleResult, BattleResultData, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { LibFleetDisband } from "libraries/fleet/LibFleetDisband.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";
/**
 * @title LibFleetRaid
 * @dev Library for handling fleet raiding logic, including resource allocation and battle resolution.
 */
library LibFleetRaid {
  /**
   * @notice Gets the raidable resource counts for an entity and its allies.
   * @dev Determines the total raidable resources for a fleet or a defender with allies.
   * @param entity The identifier of the entity (fleet or defender) being raided.
   * @return An array of raidable resource counts and the total raidable resources.
   */
  function getRaidableResourceCountsWithAllies(bytes32 entity) internal view returns (uint256[] memory, uint256) {
    return
      IsFleet.get(entity)
        ? LibFleet.getResourceCountsWithAllies(entity)
        : LibCombatAttributes.getStoredResourceCountsWithDefenders(entity);
  }

  /**
   * @notice Resolves a battle raid, distributing raided resources among attackers.
   * @dev Calculates the resources raided from a defender and distributes them to the attacking fleet and its allies.
   * @param battleEntity The identifier of the ongoing battle.
   * @param attacker The identifier of the attacking fleet.
   * @param defender The identifier of the defending entity.
   */
  function battleRaidResolve(bytes32 battleEntity, bytes32 attacker, bytes32 defender) internal {
    //maximum amount of resources the fleet can raid
    (uint256 freeCargoSpace, uint256[] memory freeCargoSpaces, uint256 totalFreeCargoSpace) = LibCombatAttributes
      .getCargoSpacesWithAllies(attacker);
    if (totalFreeCargoSpace == 0) return;
    // will caculate how much of each resource was successfuly raided from defender and increase those to be used for increasing resources of the attackers
    (uint256[] memory totalRaidedResourceCounts, uint256 total) = calculateRaidFromWithAllies(
      battleEntity,
      defender,
      totalFreeCargoSpace
    );

    receiveRaidedResources(battleEntity, attacker, totalFreeCargoSpace, freeCargoSpace, totalRaidedResourceCounts);
    bytes32[] memory allies = LibFleetStance.getAllies(attacker);
    for (uint256 i = 0; i < allies.length; i++) {
      receiveRaidedResources(
        battleEntity,
        allies[i],
        totalFreeCargoSpace,
        freeCargoSpaces[i],
        totalRaidedResourceCounts
      );
    }
  }

  /**
   * @notice Calculates the total resources raided from a defender and its allies.
   * @dev Determines the amount of each resource type that can be raided, considering the total free cargo space.
   * @param battleEntity The identifier of the ongoing battle.
   * @param defenderEntity The identifier of the defending entity.
   * @param totalFreeCargoSpace The total free cargo space available in the attacker's fleet.
   * @return totalRaidedResourceCounts , totalRaidedResources An array of total raided resource counts and the total resources raided.
   */
  function calculateRaidFromWithAllies(
    bytes32 battleEntity,
    bytes32 defenderEntity,
    uint256 totalFreeCargoSpace
  ) internal returns (uint256[] memory totalRaidedResourceCounts, uint256 totalRaidedResources) {
    (
      uint256[] memory totalRaidableResourceCounts,
      uint256 totalRaidableResources
    ) = getRaidableResourceCountsWithAllies(defenderEntity);

    totalRaidedResourceCounts = new uint256[](P_Transportables.length());

    //if the fleet can raid more than the total resources available, raid all resources
    if (totalFreeCargoSpace > totalRaidableResources) totalFreeCargoSpace = totalRaidableResources;

    if (totalFreeCargoSpace == 0) return (totalRaidedResourceCounts, totalRaidedResources);
    (totalRaidedResourceCounts, totalRaidedResources) = calculateRaidFrom(
      battleEntity,
      defenderEntity,
      totalRaidableResourceCounts,
      totalRaidableResources,
      totalFreeCargoSpace,
      totalRaidedResourceCounts,
      totalRaidedResources
    );

    bytes32[] memory allies = LibFleetStance.getAllies(defenderEntity);
    for (uint256 i = 0; i < allies.length; i++) {
      (totalRaidedResourceCounts, totalRaidedResources) = calculateRaidFrom(
        battleEntity,
        allies[i],
        totalRaidableResourceCounts,
        totalRaidableResources,
        totalFreeCargoSpace,
        totalRaidedResourceCounts,
        totalRaidedResources
      );
    }
  }

  /**
   * @dev Auxiliary function to calculate resources raided from a single entity.
   * @param battleEntity The identifier of the ongoing battle.
   * @param defenderEntity The identifier of the defending entity.
   * @param total The array of total raidable resources.
   * @param totalRaidableResources The sum of all raidable resources.
   * @param totalFreeCargoSpace The total free cargo space available in the attacker's fleet.
   * @param totalRaidedResourceCounts An array to track the resources raided.
   * @param totalRaidedResources The total resources raided so far.
   * @return An updated array of raided resource counts and the new total of raided resources.
   */
  function calculateRaidFrom(
    bytes32 battleEntity,
    bytes32 defenderEntity,
    uint256[] memory total,
    uint256 totalRaidableResources,
    uint256 totalFreeCargoSpace,
    uint256[] memory totalRaidedResourceCounts,
    uint256 totalRaidedResources
  ) internal returns (uint256[] memory, uint256) {
    if (totalFreeCargoSpace == 0 || totalRaidableResources == 0)
      return (totalRaidedResourceCounts, totalRaidedResources);

    uint8[] memory transportables = P_Transportables.get();
    BattleRaidResultData memory raidResult = BattleRaidResultData({
      resourcesAtStart: new uint256[](transportables.length),
      resourcesAtEnd: new uint256[](transportables.length)
    });
    for (uint256 i = 0; i < transportables.length; i++) {
      raidResult.resourcesAtStart[i] = ResourceCount.get(defenderEntity, transportables[i]);
      if (raidResult.resourcesAtStart[i] == 0) continue;
      uint256 resourcePortion = LibMath.divideRound(
        (raidResult.resourcesAtStart[i] * totalFreeCargoSpace),
        totalRaidableResources
      );
      if (resourcePortion > raidResult.resourcesAtStart[i]) resourcePortion = raidResult.resourcesAtStart[i];
      if (totalRaidedResources + resourcePortion > totalFreeCargoSpace)
        resourcePortion = totalFreeCargoSpace - totalRaidedResources;
      if (IsFleet.get(defenderEntity)) {
        LibFleet.decreaseFleetResource(defenderEntity, transportables[i], resourcePortion);
      } else {
        LibStorage.decreaseStoredResource(defenderEntity, transportables[i], resourcePortion);
      }
      raidResult.resourcesAtEnd[i] = ResourceCount.get(defenderEntity, transportables[i]);
      totalRaidedResourceCounts[i] += resourcePortion;
      totalRaidedResources += resourcePortion;
      if (totalRaidedResources == totalFreeCargoSpace) break;
    }
    BattleRaidResult.set(battleEntity, defenderEntity, raidResult);
    return (totalRaidedResourceCounts, totalRaidedResources);
  }

  /**
   * @dev Allocates raided resources to the attacker or its allies based on their cargo space.
   * @param battleEntity The identifier of the ongoing battle.
   * @param defenderEntity The identifier of the defender or attacking ally receiving resources.
   * @param totalFreeCargoSpace The total free cargo space available across all allied fleets.
   * @param freeCargoSpace The free cargo space available in this specific fleet.
   * @param totalRaidedResourceCounts The total resources raided from the defender and its allies.
   */
  function receiveRaidedResources(
    bytes32 battleEntity,
    bytes32 defenderEntity,
    uint256 totalFreeCargoSpace,
    uint256 freeCargoSpace,
    uint256[] memory totalRaidedResourceCounts
  ) internal {
    if (totalFreeCargoSpace == 0 || freeCargoSpace == 0) return;
    bool isFleet = IsFleet.get(defenderEntity);
    uint8[] memory transportables = P_Transportables.get();
    BattleRaidResultData memory raidResult = BattleRaidResultData({
      resourcesAtStart: new uint256[](transportables.length),
      resourcesAtEnd: new uint256[](transportables.length)
    });
    uint256 receivedResources = 0;
    bytes32 playerEntity = isFleet ? OwnedBy.get(OwnedBy.get(defenderEntity)) : OwnedBy.get(defenderEntity);
    for (uint256 i = 0; i < transportables.length; i++) {
      if (totalRaidedResourceCounts[i] == 0) continue;
      uint256 resourcePortion = LibMath.divideRound(
        (totalRaidedResourceCounts[i] * freeCargoSpace),
        totalFreeCargoSpace
      );
      raidResult.resourcesAtStart[i] = ResourceCount.get(defenderEntity, transportables[i]);
      if (resourcePortion > totalRaidedResourceCounts[i]) resourcePortion = totalRaidedResourceCounts[i];
      if (resourcePortion + receivedResources > freeCargoSpace) resourcePortion = freeCargoSpace - receivedResources;
      if (isFleet) {
        LibFleet.increaseFleetResource(defenderEntity, transportables[i], resourcePortion);
      } else {
        LibStorage.increaseStoredResource(defenderEntity, transportables[i], resourcePortion);
      }
      RaidedResource.set(
        playerEntity,
        transportables[i],
        RaidedResource.get(playerEntity, transportables[i]) + resourcePortion
      );
      receivedResources += resourcePortion;
      raidResult.resourcesAtEnd[i] = ResourceCount.get(defenderEntity, transportables[i]);
    }
    BattleRaidResult.set(battleEntity, defenderEntity, raidResult);
  }
}
