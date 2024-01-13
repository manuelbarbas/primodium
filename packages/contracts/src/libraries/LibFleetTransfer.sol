// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ERock, EResource } from "src/Types.sol";
import { P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetAttributesData, FleetAttributes, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/LibFleet.sol";
import { FleetsMap } from "libraries/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetTransfer {
  function transferUnitsFromFleetToFleet(
    bytes32 playerEntity,
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fromFleetId)) == playerEntity, "[Fleet] Can only transfer units from owned fleet");

    bytes32 spaceRock = FleetMovement.getDestination(fromFleetId);
    require(
      FleetMovement.getArrivalTime(fromFleetId) <= block.timestamp,
      "[Fleet] From fleet has not reached space rock yet"
    );

    require(
      FleetMovement.getDestination(fleetId) == spaceRock,
      "[Fleet] To fleet is not on same space rock as from fleet"
    );
    require(
      FleetMovement.getArrivalTime(fleetId) <= block.timestamp,
      "[Fleet] to Fleet has not reached space rock yet"
    );

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetId) == OwnedBy.get(fromFleetId);
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibFleet.decreaseFleetUnit(fromFleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }
  }

  function transferResourcesFromFleetToFleet(
    bytes32 playerEntity,
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fromFleetId)) == playerEntity, "[Fleet] Can only transfer units from owned fleet");

    bytes32 spaceRock = FleetMovement.getDestination(fromFleetId);
    require(
      FleetMovement.getDestination(fleetId) == spaceRock,
      "[Fleet] To fleet is not on same space rock as from fleet"
    );

    require(
      FleetMovement.getArrivalTime(fromFleetId) <= block.timestamp,
      "[Fleet] From fleet has not reached space rock yet"
    );
    require(
      FleetMovement.getArrivalTime(fleetId) <= block.timestamp,
      "[Fleet] to Fleet has not reached space rock yet"
    );

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      if (resourceCounts[i] == 0) continue;
      LibFleet.increaseFleetResource(fleetId, i, resourceCounts[i]);
      LibFleet.decreaseFleetResource(fromFleetId, i, resourceCounts[i]);
    }
  }

  function transferUnitsFromSpaceRockToFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) internal {
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only transfer units from owned space rock");
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not on space rock");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 rockUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      require(rockUnitCount >= unitCounts[i], "[Fleet] Not enough units on space rock to add to fleet");
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], !isOwner);
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !isOwner);
    }
  }

  function transferUnitsFromFleetToSpaceRock(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only transfer units from owned fleet");
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to remove from fleet");
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], !isOwner);
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !isOwner);
    }
  }

  function transferResourcesFromSpaceRockToFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only transfer resources from owned space rock");
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not on space rock");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 rockResourceCount = ResourceCount.get(spaceRock, i);
      require(rockResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.decreaseStoredResource(spaceRock, i, resourceCounts[i]);
      LibFleet.increaseFleetResource(fleetId, i, resourceCounts[i]);
    }
  }

  function transferResourcesFromFleetToSpaceRock(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only transfer resources from owned fleet");
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");
    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 fleetResourceCount = ResourceCount.get(fleetId, i);
      require(fleetResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.increaseStoredResource(spaceRock, i, resourceCounts[i]);
      LibFleet.decreaseFleetResource(fleetId, i, resourceCounts[i]);
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
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], !isOwner);
    }

    transferResourcesFromFleetToSpaceRock(playerEntity, spaceRock, fleetId, resourceCounts);

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to remove from fleet");
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !isOwner);
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
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not on space rock");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bool isOwner = OwnedBy.get(fleetId) == spaceRock;

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !isOwner);
    }

    transferResourcesFromSpaceRockToFleet(playerEntity, spaceRock, fleetId, resourceCounts);

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], !isOwner);
    }
  }

  function transferUnitsAndResourcesFromFleetToFleet(
    bytes32 playerEntity,
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fromFleetId)) == playerEntity, "[Fleet] Can only transfer units from owned fleet");

    bytes32 spaceRock = FleetMovement.getDestination(fromFleetId);
    require(
      FleetMovement.getArrivalTime(fromFleetId) <= block.timestamp,
      "[Fleet] From fleet has not reached space rock yet"
    );

    require(
      FleetMovement.getDestination(fleetId) == spaceRock,
      "[Fleet] To fleet is not on same space rock as from fleet"
    );
    require(
      FleetMovement.getArrivalTime(fleetId) <= block.timestamp,
      "[Fleet] to Fleet has not reached space rock yet"
    );

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetId) == OwnedBy.get(fromFleetId);
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromFleetToFleet(playerEntity, fromFleetId, fleetId, resourceCounts);

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fromFleetId, unitPrototypes[i]);
      LibFleet.decreaseFleetUnit(fromFleetId, unitPrototypes[i], fleetUnitCount, !sameOwner);
    }
  }
}
