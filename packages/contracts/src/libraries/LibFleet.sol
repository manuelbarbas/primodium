// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ESendType, ERock, EResource } from "src/Types.sol";
import { Position, FleetAttributesData, FleetAttributes, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { FleetsMap } from "libraries/FleetsMap.sol";
import { SendArgs } from "src/Types.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey } from "src/Keys.sol";
import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";
import { EResource } from "src/Types.sol";

library LibFleet {
  /// @notice creates a fleet.
  function createFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal returns (bytes32 fleetId) {
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only create fleet on owned space rock");
    require(ResourceCount.get(spaceRock, uint8(EResource.U_MaxMoves)) > 0, "[Fleet] Space rock has no max moves");
    LibStorage.decreaseStoredResource(spaceRock, uint8(EResource.U_MaxMoves), 1);
    //require(ResourceCount.get(spaceRock, EResource.U_Cargo) > 0, "[Fleet] Space rock has no cargo capacity"))
    fleetId = LibEncode.getTimedHash(playerEntity, FleetKey);
    OwnedBy.set(fleetId, spaceRock);

    FleetMovement.set(
      fleetId,
      FleetMovementData({
        arrivalTime: block.timestamp,
        sendTime: block.timestamp,
        origin: spaceRock,
        destination: spaceRock
      })
    );

    FleetAttributes.set(fleetId, FleetAttributesData({ speed: 0, attack: 0, defense: 0, cargo: 0, occupiedCargo: 0 }));

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 rockUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      require(rockUnitCount >= unitCounts[i], "[Fleet] Not enough units to add to fleet");
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
      increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
    }

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 rockResourceCount = ResourceCount.get(spaceRock, i);
      require(rockResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.decreaseStoredResource(spaceRock, i, resourceCounts[i]);
      increaseFleetResource(fleetId, i, resourceCounts[i]);
    }

    FleetsMap.add(spaceRock, FleetOwnedByKey, fleetId);
    FleetsMap.add(spaceRock, FleetIncomingKey, fleetId);
  }

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
      increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
      decreaseFleetUnit(fromFleetId, unitPrototypes[i], unitCounts[i]);
      if (!sameOwner) {
        LibUnit.updateStoredUtilities(OwnedBy.get(fleetId), unitPrototypes[i], unitCounts[i], true);
        LibUnit.updateStoredUtilities(OwnedBy.get(fromFleetId), unitPrototypes[i], unitCounts[i], false);
      }
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
      increaseFleetResource(fleetId, i, resourceCounts[i]);
      decreaseFleetResource(fromFleetId, i, resourceCounts[i]);
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
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
      if (!isOwner) LibUnit.updateStoredUtilities(spaceRock, unitPrototypes[i], unitCounts[i], false);
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
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to remove from fleet");
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
      if (!isOwner) LibUnit.updateStoredUtilities(spaceRock, unitPrototypes[i], unitCounts[i], true);
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
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not on space rock");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

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
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");
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
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
      if (!isOwner) LibUnit.updateStoredUtilities(spaceRock, unitPrototypes[i], unitCounts[i], true);
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
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not on space rock");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
    }

    transferResourcesFromSpaceRockToFleet(playerEntity, spaceRock, fleetId, resourceCounts);
    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i]);
      if (!isOwner) LibUnit.updateStoredUtilities(spaceRock, unitPrototypes[i], unitCounts[i], false);
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
      increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i]);
      if (!sameOwner) {
        LibUnit.updateStoredUtilities(OwnedBy.get(fleetId), unitPrototypes[i], unitCounts[i], true);
        LibUnit.updateStoredUtilities(OwnedBy.get(fromFleetId), unitPrototypes[i], unitCounts[i], false);
      }
    }

    transferResourcesFromFleetToFleet(playerEntity, fromFleetId, fleetId, resourceCounts);

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fromFleetId, unitPrototypes[i]);
      decreaseFleetUnit(fromFleetId, unitPrototypes[i], fleetUnitCount);
    }
  }

  function increaseFleetUnit(
    bytes32 fleetId,
    bytes32 unitPrototype,
    uint256 unitCount
  ) internal {
    if (unitCount == 0) return;
    FleetAttributesData memory fleetAttributes = FleetAttributes.get(fleetId);
    bytes32 ownerSpaceRockEntity = OwnedBy.get(fleetId);
    uint256 unitLevel = UnitLevel.get(ownerSpaceRockEntity, unitPrototype);
    P_UnitData memory unitData = P_Unit.get(unitPrototype, unitLevel);
    uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototype);
    if (fleetUnitCount == 0) {
      if (unitData.speed < fleetAttributes.speed) {
        fleetAttributes.speed = unitData.speed;
      }
    }
    fleetAttributes.attack += unitData.attack * unitCount;
    fleetAttributes.defense += unitData.defense * unitCount;
    fleetAttributes.cargo += unitData.cargo * unitCount;
    FleetAttributes.set(fleetId, fleetAttributes);
    UnitCount.set(fleetId, unitPrototype, fleetUnitCount + unitCount);
  }

  function decreaseFleetUnit(
    bytes32 fleetId,
    bytes32 unitPrototype,
    uint256 unitCount
  ) internal {
    if (unitCount == 0) return;

    uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototype);
    require(fleetUnitCount >= unitCount, "[Fleet] Not enough units to remove from fleet");

    FleetAttributesData memory fleetAttributes = FleetAttributes.get(fleetId);
    bytes32 ownerSpaceRockEntity = OwnedBy.get(fleetId);
    uint256 unitLevel = UnitLevel.get(ownerSpaceRockEntity, unitPrototype);
    P_UnitData memory unitData = P_Unit.get(unitPrototype, unitLevel);
    if (fleetUnitCount - unitCount == 0) {
      if (unitData.speed == fleetAttributes.speed) {
        fleetAttributes.speed = unitData.speed;
      }
    }
    fleetAttributes.attack -= unitData.attack * unitCount;
    fleetAttributes.defense -= unitData.defense * unitCount;
    fleetAttributes.cargo -= unitData.cargo * unitCount;
    require(
      fleetAttributes.cargo >= FleetAttributes.getOccupiedCargo(fleetId),
      "[Fleet] Fleet doesn't have enough storage"
    );

    UnitCount.set(fleetId, unitPrototype, fleetUnitCount - unitCount);
    FleetAttributes.setOccupiedCargo(fleetId, FleetAttributes.getOccupiedCargo(fleetId) - (unitData.cargo * unitCount));
  }

  function increaseFleetResource(
    bytes32 fleetId,
    uint8 resource,
    uint256 amount
  ) internal {
    if (amount == 0) return;
    uint256 currOccupiedCargo = FleetAttributes.getOccupiedCargo(fleetId);
    require(
      currOccupiedCargo + amount <= FleetAttributes.getCargo(fleetId),
      "[Fleet] Not enough storage to add resource"
    );
    ResourceCount.set(fleetId, resource, ResourceCount.get(fleetId, resource) + amount);
    FleetAttributes.setOccupiedCargo(fleetId, currOccupiedCargo + amount);
  }

  function decreaseFleetResource(
    bytes32 fleetId,
    uint8 resource,
    uint256 amount
  ) internal {
    if (amount == 0) return;
    uint256 currOccupiedCargo = FleetAttributes.getOccupiedCargo(fleetId);
    uint256 currResourceCount = ResourceCount.get(fleetId, resource);
    require(currResourceCount >= amount && currOccupiedCargo >= amount, "[Fleet] Not enough stored resource to remove");
    ResourceCount.set(fleetId, resource, currResourceCount - amount);
    FleetAttributes.setOccupiedCargo(fleetId, currOccupiedCargo - amount);
  }

  function landFleet(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 spaceRock
  ) internal {
    bytes32 spaceRockOwner = OwnedBy.get(spaceRock);
    require(OwnedBy.get(spaceRockOwner) == playerEntity, "[Fleet] Can only transfer units from owned fleet");
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only land fleet on owned space rock");

    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");
    require(FleetMovement.getArrivalTime(fleetId) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    bool isOwner = spaceRockOwner == spaceRock;
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], fleetUnitCount);
      if (!isOwner) LibUnit.updateStoredUtilities(spaceRock, unitPrototypes[i], fleetUnitCount, true);
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

    LibStorage.increaseStoredResource(spaceRockOwner, uint8(EResource.U_MaxMoves), 1);
    FleetsMap.remove(spaceRockOwner, FleetOwnedByKey, fleetId);
    FleetsMap.remove(spaceRock, FleetIncomingKey, fleetId);
    OwnedBy.deleteRecord(fleetId);
  }

  function mergeFleets(bytes32 playerEntity, bytes32[] calldata fleets) internal {
    require(fleets.length > 1, "[Fleet] Can only merge more than one fleet");
    bytes32 spaceRock = FleetMovement.getDestination(fleets[0]);
    require(FleetMovement.getArrivalTime(fleets[0]) <= block.timestamp, "[Fleet] Fleet has not reached space rock yet");
    require(OwnedBy.get(OwnedBy.get(fleets[0])) == playerEntity, "[Fleet] Can only merge owned fleets");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[NUM_UNITS] memory unitCounts;

    for (uint256 i = 1; i < fleets.length; i++) {
      require(OwnedBy.get(OwnedBy.get(fleets[i])) == playerEntity, "[Fleet] Can only merge owned fleets");
      require(FleetMovement.getDestination(fleets[i]) == spaceRock, "[Fleet] Fleets must be on same space rock");
      require(
        FleetMovement.getArrivalTime(fleets[i]) <= block.timestamp,
        "[Fleet] Fleet has not reached space rock yet"
      );
      for (uint8 j = 0; j < NUM_UNITS; j++) {
        unitCounts[j] += UnitCount.get(fleets[i], unitPrototypes[j]);
      }
    }
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      increaseFleetUnit(fleets[0], unitPrototypes[i], unitCounts[i]);
    }

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 totalResourceCount = 0;
      for (uint256 j = 1; j < fleets.length; j++) {
        uint256 resourceCount = ResourceCount.get(fleets[j], i);
        decreaseFleetResource(fleets[j], i, resourceCount);

        totalResourceCount += resourceCount;
      }
      increaseFleetResource(fleets[0], i, totalResourceCount);
    }

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      for (uint256 j = 1; j < fleets.length; j++) {
        uint256 fleetUnitCount = UnitCount.get(fleets[j], unitPrototypes[i]);
        decreaseFleetUnit(fleets[j], unitPrototypes[i], fleetUnitCount);
      }
    }

    for (uint256 i = 1; i < fleets.length; i++) {
      bytes32 spaceRockOwner = OwnedBy.get(fleets[i]);

      LibStorage.increaseStoredResource(spaceRockOwner, uint8(EResource.U_MaxMoves), 1);
      OwnedBy.deleteRecord(fleets[i]);

      FleetsMap.remove(spaceRockOwner, FleetOwnedByKey, fleets[i]);
      FleetsMap.remove(spaceRock, FleetIncomingKey, fleets[i]);
    }
  }

  function sendFleet(
    bytes32 playerEntity,
    bytes32 fleetId,
    bytes32 destination
  ) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only send owned fleet");
    require(
      FleetMovement.getArrivalTime(fleetId) <= block.timestamp,
      "[Fleet] Fleet has not reached it's current destination space rock yet"
    );

    FleetsMap.remove(FleetMovement.getDestination(fleetId), FleetIncomingKey, fleetId);
    FleetsMap.add(destination, FleetIncomingKey, fleetId);

    FleetMovement.setDestination(fleetId, destination);
    FleetMovement.setArrivalTime(fleetId, getArrivalTime(fleetId, Position.get(destination)));
    FleetMovement.setSendTime(fleetId, block.timestamp);
  }

  function recallFleet(bytes32 playerEntity, bytes32 fleetId) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only send owned fleet");
    require(
      FleetMovement.getOrigin(fleetId) != FleetMovement.getDestination(fleetId),
      "[Fleet] Fleet is already at origin"
    );

    FleetsMap.remove(FleetMovement.getDestination(fleetId), FleetIncomingKey, fleetId);
    FleetsMap.add(FleetMovement.getOrigin(fleetId), FleetIncomingKey, fleetId);
    FleetMovement.setOrigin(fleetId, FleetMovement.getDestination(fleetId));
    FleetMovement.setDestination(fleetId, FleetMovement.getOrigin(fleetId));

    FleetMovement.setArrivalTime(fleetId, block.timestamp + block.timestamp - FleetMovement.getSendTime(fleetId));
    FleetMovement.setSendTime(fleetId, block.timestamp);
  }

  function sendFleets(
    bytes32 playerEntity,
    bytes32[] memory fleetIds,
    bytes32 destination
  ) internal {
    require(fleetIds.length > 1, "[Fleet] Send Fleets can only send more than one fleet");
    bytes32 slowestFleet = fleetIds[0];
    uint256 slowestSpeed = getFleetSlowestUnitSpeed(slowestFleet);
    for (uint256 i = 0; i < fleetIds.length; i++) {
      require(OwnedBy.get(OwnedBy.get(fleetIds[i])) == playerEntity, "[Fleet] Can only send owned fleet");
      require(
        FleetMovement.getArrivalTime(fleetIds[i]) <= block.timestamp,
        "[Fleet] Fleet has not reached it's current destination space rock yet"
      );

      uint256 fleetSpeed = getFleetSlowestUnitSpeed(fleetIds[i]);
      if (fleetSpeed < slowestSpeed) {
        slowestSpeed = fleetSpeed;
        slowestFleet = fleetIds[i];
      }

      FleetsMap.remove(FleetMovement.getDestination(fleetIds[i]), FleetIncomingKey, fleetIds[i]);
      FleetsMap.add(destination, FleetIncomingKey, fleetIds[i]);

      FleetMovement.setDestination(fleetIds[i], destination);
      FleetMovement.setSendTime(fleetIds[i], block.timestamp);
    }

    for (uint256 i = 0; i < fleetIds.length; i++) {
      FleetMovement.setArrivalTime(fleetIds[i], getArrivalTime(fleetIds[i], Position.get(destination)));
    }
  }

  function recallFleet(bytes32 playerEntity, bytes32 fleetId) internal {
    require(OwnedBy.get(OwnedBy.get(fleetId)) == playerEntity, "[Fleet] Can only send owned fleet");
    require(
      FleetMovement.getOrigin(fleetId) != FleetMovement.getDestination(fleetId),
      "[Fleet] Fleet is already at origin"
    );

    FleetsMap.remove(FleetMovement.getDestination(fleetId), FleetIncomingKey, fleetId);
    FleetsMap.add(FleetMovement.getOrigin(fleetId), FleetIncomingKey, fleetId);
    FleetMovement.setOrigin(fleetId, FleetMovement.getDestination(fleetId));
    FleetMovement.setDestination(fleetId, FleetMovement.getOrigin(fleetId));

    FleetMovement.setArrivalTime(fleetId, block.timestamp + block.timestamp - FleetMovement.getSendTime(fleetId));
    FleetMovement.setSendTime(fleetId, block.timestamp);
  }

  /// @notice Computes the block number an arrival will occur.
  /// @param destination Destination position.
  /// @return Block number of arrival.
  function getArrivalTime(bytes32 fleetId, PositionData memory destination) internal view returns (uint256) {
    P_GameConfigData memory config = P_GameConfig.get();
    uint256 unitSpeed = getFleetSlowestUnitSpeed(fleetId);
    require(unitSpeed > 0 && config.travelTime > 0, "[Fleet] Slowest unit speed must be greater than 0");

    bytes32 origin = FleetMovement.getOrigin(fleetId);
    return
      block.timestamp +
      ((LibMath.distance(Position.get(origin), destination) *
        config.travelTime *
        WORLD_SPEED_SCALE *
        UNIT_SPEED_SCALE) / (config.worldSpeed * unitSpeed));
  }

  /// @notice Returns the slowest speed of given unit types.
  /// @param fleetId fleet being sent.
  /// @return slowestSpeed Slowest unit speed among the types.
  function getFleetSlowestUnitSpeed(bytes32 fleetId) internal view returns (uint256 slowestSpeed) {
    bytes32 ownerSpaceRockEntity = OwnedBy.get(fleetId);
    uint256 bignum = 115792089237316195423570985008687907853269984665640564039457584007913129639935;
    slowestSpeed = bignum;
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      uint256 unitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      if (unitCount == 0) continue;
      uint256 unitLevel = UnitLevel.get(ownerSpaceRockEntity, unitPrototypes[i]);
      uint256 speed = P_Unit.getSpeed(unitPrototypes[i], unitLevel);
      if (speed < slowestSpeed) {
        slowestSpeed = speed;
      }
    }
    if (slowestSpeed == bignum) return 0;
    return slowestSpeed;
  }
}
