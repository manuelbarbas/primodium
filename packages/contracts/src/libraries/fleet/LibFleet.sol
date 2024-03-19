// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EResource } from "src/Types.sol";
import { IsFleet, IsFleetEmpty, GracePeriod, P_GracePeriod, P_Transportables, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { LibFleetStance } from "libraries/fleet/LibFleetStance.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";
import { WORLD_SPEED_SCALE } from "src/constants.sol";

import { EResource, EFleetStance } from "src/Types.sol";

library LibFleet {
  /// @notice creates a fleet.
  function createFleet(
    bytes32 playerEntity,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal returns (bytes32 fleetEntity) {
    require(ResourceCount.get(asteroidEntity, uint8(EResource.U_MaxFleets)) > 0, "[Fleet] asteroid has no max moves");
    LibStorage.decreaseStoredResource(asteroidEntity, uint8(EResource.U_MaxFleets), 1);
    fleetEntity = LibEncode.getTimedHash(playerEntity, FleetKey);
    uint256 gracePeriodLength = (P_GracePeriod.getFleet() * WORLD_SPEED_SCALE) / P_GameConfig.getWorldSpeed();
    GracePeriod.set(fleetEntity, block.timestamp + gracePeriodLength);

    OwnedBy.set(fleetEntity, asteroidEntity);
    IsFleet.set(fleetEntity, true);
    IsFleetEmpty.set(fleetEntity, false);

    FleetMovement.set(
      fleetEntity,
      FleetMovementData({
        arrivalTime: block.timestamp,
        sendTime: block.timestamp,
        origin: asteroidEntity,
        destination: asteroidEntity
      })
    );

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      uint256 asteroidUnitCount = UnitCount.get(asteroidEntity, unitPrototypes[i]);
      require(asteroidUnitCount >= unitCounts[i], "[Fleet] Not enough units to add to fleet");
      LibUnit.decreaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], false);
      increaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], false);
    }

    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 asteroidResourceCount = ResourceCount.get(asteroidEntity, transportables[i]);
      require(asteroidResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.decreaseStoredResource(asteroidEntity, transportables[i], resourceCounts[i]);
      increaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
    }

    FleetSet.add(asteroidEntity, FleetOwnedByKey, fleetEntity);
    FleetSet.add(asteroidEntity, FleetIncomingKey, fleetEntity);
  }

  function increaseFleetUnit(
    bytes32 fleetEntity,
    bytes32 unitPrototype,
    uint256 unitCount,
    bool updatesUtility
  ) internal {
    if (unitCount == 0) return;
    if (updatesUtility) {
      LibUnit.updateStoredUtilities(OwnedBy.get(fleetEntity), unitPrototype, unitCount, true);
    }
    UnitCount.set(fleetEntity, unitPrototype, UnitCount.get(fleetEntity, unitPrototype) + unitCount);
  }

  function decreaseFleetUnit(
    bytes32 fleetEntity,
    bytes32 unitPrototype,
    uint256 unitCount,
    bool updatesUtility
  ) internal {
    if (unitCount == 0) return;
    uint256 fleetUnitCount = UnitCount.get(fleetEntity, unitPrototype);
    require(fleetUnitCount >= unitCount, "[Fleet] Not enough units to remove from fleet");
    if (updatesUtility) {
      LibUnit.updateStoredUtilities(OwnedBy.get(fleetEntity), unitPrototype, unitCount, false);
    }
    UnitCount.set(fleetEntity, unitPrototype, fleetUnitCount - unitCount);
  }

  function getResourceCounts(bytes32 fleetEntity) internal view returns (uint256[] memory resourceCounts) {
    uint8[] memory transportables = P_Transportables.get();
    resourceCounts = new uint256[](transportables.length);
    for (uint256 i = 0; i < transportables.length; i++) {
      resourceCounts[i] = ResourceCount.get(fleetEntity, transportables[i]);
    }
    return resourceCounts;
  }

  function getResourceCountsWithAllies(
    bytes32 fleetEntity
  ) internal view returns (uint256[] memory resourceCounts, uint256 totalResources) {
    bytes32[] memory followerFleetEntities = LibFleetStance.getFollowerFleets(fleetEntity);
    uint8[] memory transportables = P_Transportables.get();
    resourceCounts = new uint256[](transportables.length);
    for (uint256 i = 0; i < transportables.length; i++) {
      resourceCounts[i] = ResourceCount.get(fleetEntity, transportables[i]);
      for (uint8 j = 0; j < followerFleetEntities.length; j++) {
        resourceCounts[i] += ResourceCount.get(followerFleetEntities[j], transportables[i]);
      }
      totalResources += resourceCounts[i];
    }
  }

  function increaseFleetResource(bytes32 fleetEntity, uint8 resource, uint256 amount) internal {
    if (amount == 0) return;
    uint256 freeCargoSpace = LibCombatAttributes.getCargoSpace(fleetEntity);
    require(freeCargoSpace >= amount, "[Fleet] Not enough storage to add resource");
    ResourceCount.set(fleetEntity, resource, ResourceCount.get(fleetEntity, resource) + amount);
  }

  function decreaseFleetResource(bytes32 fleetEntity, uint8 resource, uint256 amount) internal {
    if (amount == 0) return;
    uint256 currResourceCount = ResourceCount.get(fleetEntity, resource);
    require(currResourceCount >= amount, "[Fleet] Not enough stored resource to remove");
    ResourceCount.set(fleetEntity, resource, currResourceCount - amount);
  }

  function landFleet(bytes32 playerEntity, bytes32 fleetEntity, bytes32 asteroidEntity) internal {
    bytes32 asteroidOwnerEntity = OwnedBy.get(fleetEntity);

    bool isOwner = asteroidOwnerEntity == asteroidEntity;

    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      uint256 fleetResourceCount = ResourceCount.get(fleetEntity, transportables[i]);
      if (fleetResourceCount == 0) continue;
      LibStorage.increaseStoredResource(asteroidEntity, transportables[i], fleetResourceCount);
      decreaseFleetResource(fleetEntity, transportables[i], fleetResourceCount);
    }

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetEntity, unitPrototypes[i]);
      if (fleetUnitCount == 0) continue;
      decreaseFleetUnit(fleetEntity, unitPrototypes[i], fleetUnitCount, !isOwner);
      LibUnit.increaseUnitCount(asteroidEntity, unitPrototypes[i], fleetUnitCount, !isOwner);
    }
    if (!isOwner) {
      resetFleetOrbit(fleetEntity);
    }
  }

  function mergeFleets(bytes32 playerEntity, bytes32[] calldata fleets) internal {
    require(fleets.length > 1, "[Fleet] Can only merge more than one fleet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[] memory unitCounts = new uint256[](unitPrototypes.length);
    for (uint256 i = 1; i < fleets.length; i++) {
      for (uint8 j = 0; j < unitPrototypes.length; j++) {
        unitCounts[j] += UnitCount.get(fleets[i], unitPrototypes[j]);
      }
    }

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      increaseFleetUnit(fleets[0], unitPrototypes[i], unitCounts[i], false);
    }
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      uint256 totalResourceCount = 0;
      for (uint256 j = 1; j < fleets.length; j++) {
        uint256 resourceCount = ResourceCount.get(fleets[j], transportables[i]);
        if (resourceCount == 0) continue;
        decreaseFleetResource(fleets[j], transportables[i], resourceCount);

        totalResourceCount += resourceCount;
      }
      if (totalResourceCount == 0) continue;
      increaseFleetResource(fleets[0], transportables[i], totalResourceCount);
    }

    for (uint256 i = 1; i < fleets.length; i++) {
      for (uint256 j = 0; j < unitPrototypes.length; j++) {
        uint256 fleetUnitCount = UnitCount.get(fleets[i], unitPrototypes[j]);
        decreaseFleetUnit(fleets[i], unitPrototypes[j], fleetUnitCount, false);
      }

      resetFleetOrbit(fleets[i]);
    }
  }

  function isFleetEmpty(bytes32 fleetEntity) internal view returns (bool) {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      if (UnitCount.get(fleetEntity, unitPrototypes[i]) > 0) return false;
    }

    return true;
  }

  function resetFleetIfNoUnitsLeft(bytes32 fleetEntity) internal {
    if (!isFleetEmpty(fleetEntity)) return;

    resetFleetOrbit(fleetEntity);
  }

  function checkAndSetFleetEmpty(bytes32 fleetEntity) internal {
    if (isFleetEmpty(fleetEntity)) {
      IsFleetEmpty.set(fleetEntity, true);
    } else {
      IsFleetEmpty.set(fleetEntity, false);
    }
  }

  function resetFleetOrbit(bytes32 fleetEntity) internal {
    //clears any stance
    LibFleetStance.clearFleetStance(fleetEntity);
    //clears any following fleets
    LibFleetStance.clearFollowingFleets(fleetEntity);
    IsFleetEmpty.set(fleetEntity, true);

    bytes32 asteroidEntity = FleetMovement.getDestination(fleetEntity);
    bytes32 asteroidOwnerEntity = OwnedBy.get(fleetEntity);

    if (asteroidOwnerEntity != asteroidEntity) {
      //remove fleet from incoming of current asteroid
      FleetSet.remove(asteroidEntity, FleetIncomingKey, fleetEntity);
      //set fleet to orbit of owner asteroid
      FleetSet.add(asteroidOwnerEntity, FleetIncomingKey, fleetEntity);
    }

    FleetMovement.set(
      fleetEntity,
      FleetMovementData({
        arrivalTime: block.timestamp,
        sendTime: block.timestamp,
        origin: asteroidOwnerEntity,
        destination: asteroidOwnerEntity
      })
    );
  }
}
