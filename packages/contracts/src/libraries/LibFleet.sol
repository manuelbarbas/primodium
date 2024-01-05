// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ESendType, Arrival, ERock, EResource } from "src/Types.sol";
import { FleetStatusData, FleetStatus, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, UnitLevel, P_GameConfig, P_GameConfigData, ArrivalCount, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { FleetsMap } from "libraries/FleetsMap.sol";
import { SendArgs } from "src/Types.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey } from "src/Keys.sol";
import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";

library LibFleet {
  /// @notice creates a fleet.
  function createFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal returns (bytes32 fleetId) {
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only create fleet on owned space rock");
    //require(ResourceCount.get(spaceRock, EResource.U_Cargo) > 0, "[Fleet] Space rock has no cargo capacity"))
    fleetId = LibEncode.getTimedHash(playerEntity, FleetKey);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 rockUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      require(rockUnitCount >= unitCounts[i], "[Fleet] Not enough units to add to fleet");
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
      increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
    }
    uint256 cargo = LibUnit.getTotalCargo(playerEntity, unitCounts);

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 rockResourceCount = ResourceCount.get(spaceRock, i);
      require(rockResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.decreaseStoredResource(spaceRock, i, resourceCounts[i]);
      increaseFleetResource(fleetId, i, resourceCounts[i]);
    }

    FleetStatus.set(
      fleetId,
      FleetStatusData({
        arrivalTime: block.timestamp,
        sendTime: block.timestamp,
        origin: spaceRock,
        destination: spaceRock,
        resourceStorage: cargo,
        occupiedStorage: 0
      })
    );
    OwnedBy.set(fleetId, spaceRock);
    FleetsMap.add(spaceRock, FleetOwnedByKey, fleetId);
    FleetsMap.add(spaceRock, FleetIncomingKey, fleetId);
  }

  function transferUnitsFromSpaceRockToFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) internal {
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only transfer units from owned space rock");
    require(FleetStatus.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not on space rock");
    require(FleetStatus.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 rockUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      require(rockUnitCount >= unitCounts[i], "[Fleet] Not enough units on space rock to add to fleet");
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
      increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
    }
  }

  function transferUnitsFromFleetToSpaceRock(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only transfer units from owned fleet");
    require(FleetStatus.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetStatus.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to remove from fleet");
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
      decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
    }
  }

  function transferResourcesFromSpaceRockToFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only transfer resources from owned space rock");
    require(FleetStatus.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not on space rock");
    require(FleetStatus.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 rockResourceCount = ResourceCount.get(spaceRock, i);
      require(rockResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.decreaseStoredResource(spaceRock, i, resourceCounts[i]);
      increaseFleetResource(fleetId, i, resourceCounts[i]);
    }
  }

  function transferResourcesFromFleetToSpaceRock(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only transfer resources from owned fleet");
    require(FleetStatus.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetStatus.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");
    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 fleetResourceCount = ResourceCount.get(fleetId, i);
      require(fleetResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.increaseStoredResource(spaceRock, i, resourceCounts[i]);
      decreaseFleetResource(fleetId, i, resourceCounts[i]);
    }
  }

  //this is required so unit cargo space can be updated correctly without loss of resources
  function transferUnitsAndResourcesFromFleetToSpaceRock(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only transfer units from owned fleet");
    require(FleetStatus.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetStatus.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
    }

    transferResourcesFromFleetToSpaceRock(playerEntity, spaceRock, fleetId, resourceCounts);

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to remove from fleet");
      decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
    }
  }

  function transferUnitsAndResourcesFromSpaceRockToFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only transfer units from owned space rock");
    require(FleetStatus.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not on space rock");
    require(FleetStatus.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
    }

    transferResourcesFromSpaceRockToFleet(playerEntity, spaceRock, fleetId, resourceCounts);

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to remove from spaceRock");
    }
  }

  function increaseFleetUnit(
    bytes32 fleetId,
    bytes32 unitPrototype,
    uint256 unitCount
  ) internal {
    uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototype);
    UnitCount.set(fleetId, unitPrototype, fleetUnitCount + unitCount);
    uint256 cargo = P_Unit.get(unitPrototype, UnitLevel.get(OwnedBy.get(OwnedBy.get(fleetId)), unitPrototype)).cargo;
    FleetStatus.setResourceStorage(fleetId, FleetStatus.getResourceStorage(fleetId) + unitCount * cargo);
  }

  function decreaseFleetUnit(
    bytes32 fleetId,
    bytes32 unitPrototype,
    uint256 unitCount
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototype);
    require(fleetUnitCount >= unitCount, "[Fleet] Not enough units to remove from fleet");
    UnitCount.set(fleetId, unitPrototype, fleetUnitCount - unitCount);
    uint256 cargo = P_Unit.get(unitPrototype, UnitLevel.get(OwnedBy.get(OwnedBy.get(fleetId)), unitPrototype)).cargo;
    FleetStatus.setResourceStorage(fleetId, FleetStatus.getResourceStorage(fleetId) + unitCount * cargo);
  }

  function increaseFleetResource(
    bytes32 fleetId,
    uint8 resource,
    uint256 amount
  ) internal {
    if (amount == 0) return;
    uint256 currOccupiedStorage = FleetStatus.getOccupiedStorage(fleetId);
    require(
      currOccupiedStorage + amount <= FleetStatus.getResourceStorage(fleetId),
      "[Fleet] Not enough storage to add resource"
    );
    ResourceCount.set(fleetId, resource, ResourceCount.get(fleetId, resource) + amount);
    FleetStatus.setOccupiedStorage(fleetId, currOccupiedStorage + amount);
  }

  function decreaseFleetResource(
    bytes32 fleetId,
    uint8 resource,
    uint256 amount
  ) internal {
    if (amount == 0) return;
    uint256 currOccupiedStorage = FleetStatus.getOccupiedStorage(fleetId);
    uint256 currResourceCount = ResourceCount.get(fleetId, resource);
    require(
      currResourceCount >= amount && currOccupiedStorage >= amount,
      "[Fleet] Not enough stored resource to remove"
    );
    ResourceCount.set(fleetId, resource, currResourceCount - amount);
    FleetStatus.setOccupiedStorage(fleetId, currOccupiedStorage - amount);
  }

  function landFleet(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 spaceRock
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only transfer units from owned fleet");
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only land fleet on owned space rock");

    require(FleetStatus.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetStatus.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], fleetUnitCount);
    }

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 fleetResourceCount = ResourceCount.get(fleetId, i);
      LibStorage.increaseStoredResource(spaceRock, i, fleetResourceCount);
      decreaseFleetResource(fleetId, i, fleetResourceCount);
    }

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      decreaseFleetUnit(fleetId, unitPrototypes[i], fleetUnitCount);
    }
  }
}
