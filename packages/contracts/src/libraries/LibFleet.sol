// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ERock, EResource } from "src/Types.sol";
import { P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetAttributesData, FleetAttributes, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { FleetsMap } from "libraries/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleet {
  /// @notice creates a fleet.
  function createFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal returns (bytes32 fleetId) {
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

    FleetAttributes.set(
      fleetId,
      FleetAttributesData({ speed: 0, attack: 0, defense: 0, cargo: 0, occupiedCargo: 0, hp: 0, maxHp: 0 })
    );

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      if (unitCounts[i] == 0) continue;
      uint256 rockUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      require(rockUnitCount >= unitCounts[i], "[Fleet] Not enough units to add to fleet");
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], false);
      increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], false);
    }

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 rockResourceCount = ResourceCount.get(spaceRock, i);
      require(rockResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.decreaseStoredResource(spaceRock, i, resourceCounts[i]);
      increaseFleetResource(fleetId, i, resourceCounts[i]);
    }

    FleetsMap.add(spaceRock, FleetOwnedByKey, fleetId);
    FleetsMap.add(spaceRock, FleetIncomingKey, fleetId);
  }

  function increaseFleetUnit(
    bytes32 fleetId,
    bytes32 unitPrototype,
    uint256 unitCount,
    bool updatesUtility
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
    fleetAttributes.maxHp += unitData.hp * unitCount;
    fleetAttributes.hp += unitData.hp * unitCount;
    FleetAttributes.set(fleetId, fleetAttributes);
    if (updatesUtility) {
      LibUnit.updateStoredUtilities(ownerSpaceRockEntity, unitPrototype, unitCount, true);
    }

    UnitCount.set(fleetId, unitPrototype, fleetUnitCount + unitCount);
  }

  function decreaseFleetUnit(
    bytes32 fleetId,
    bytes32 unitPrototype,
    uint256 unitCount,
    bool updatesUtility
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
    uint256 hpDifferential = unitData.hp * unitCount;
    fleetAttributes.maxHp -= hpDifferential;
    if (fleetAttributes.hp > fleetAttributes.maxHp) {
      fleetAttributes.hp = fleetAttributes.maxHp;
    }
    if (updatesUtility) {
      LibUnit.updateStoredUtilities(ownerSpaceRockEntity, unitPrototype, unitCount, false);
    }
    UnitCount.set(fleetId, unitPrototype, fleetUnitCount - unitCount);
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
    require(FleetMovement.getDestination(fleetId) == spaceRock, "[Fleet] Fleet is not in space rock orbit");

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    bool isOwner = spaceRockOwner == spaceRock;
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], fleetUnitCount, !isOwner);
    }

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 fleetResourceCount = ResourceCount.get(fleetId, i);
      if (fleetResourceCount == 0) continue;
      LibStorage.increaseStoredResource(spaceRock, i, fleetResourceCount);
      decreaseFleetResource(fleetId, i, fleetResourceCount);
    }

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      decreaseFleetUnit(fleetId, unitPrototypes[i], fleetUnitCount, !isOwner);
    }
    if (!isOwner) {
      FleetMovement.set(
        fleetId,
        FleetMovementData({
          arrivalTime: block.timestamp,
          sendTime: block.timestamp,
          origin: spaceRockOwner,
          destination: spaceRockOwner
        })
      );
      FleetsMap.remove(spaceRock, FleetIncomingKey, fleetId);
      FleetsMap.add(spaceRockOwner, FleetIncomingKey, fleetId);
    }
  }

  function mergeFleets(bytes32 playerEntity, bytes32[] calldata fleets) internal {
    require(fleets.length > 1, "[Fleet] Can only merge more than one fleet");
    bytes32 spaceRock = FleetMovement.getDestination(fleets[0]);
    bytes32 spaceRockOwner = OwnedBy.get(fleets[0]);

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    uint256[NUM_UNITS] memory unitCounts;
    for (uint256 i = 1; i < fleets.length; i++) {
      for (uint8 j = 0; j < NUM_UNITS; j++) {
        unitCounts[j] += UnitCount.get(fleets[i], unitPrototypes[j]);
      }
    }

    for (uint8 i = 0; i < NUM_UNITS; i++) {
      increaseFleetUnit(fleets[0], unitPrototypes[i], unitCounts[i], false);
    }

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 totalResourceCount = 0;
      for (uint256 j = 1; j < fleets.length; j++) {
        uint256 resourceCount = ResourceCount.get(fleets[j], i);
        if (resourceCount == 0) continue;
        decreaseFleetResource(fleets[j], i, resourceCount);

        totalResourceCount += resourceCount;
      }
      if (totalResourceCount == 0) continue;
      increaseFleetResource(fleets[0], i, totalResourceCount);
    }

    for (uint256 i = 1; i < fleets.length; i++) {
      for (uint8 j = 0; j < NUM_UNITS; j++) {
        uint256 fleetUnitCount = UnitCount.get(fleets[i], unitPrototypes[j]);
        decreaseFleetUnit(fleets[i], unitPrototypes[j], fleetUnitCount, false);
      }

      resetFleetOrbit(fleets[i]);
    }
  }

  function resetFleetOrbit(bytes32 fleetId) internal {
    bytes32 spaceRock = FleetMovement.getDestination(fleetId);
    bytes32 spaceRockOwner = OwnedBy.get(spaceRock);
    FleetsMap.remove(spaceRock, FleetIncomingKey, fleetId);
    FleetMovement.set(
      fleetId,
      FleetMovementData({
        arrivalTime: block.timestamp,
        sendTime: block.timestamp,
        origin: spaceRockOwner,
        destination: spaceRockOwner
      })
    );
    FleetsMap.add(spaceRockOwner, FleetIncomingKey, fleetId);
  }

  function isFleetDamaged(bytes32 fleetId) internal view returns (bool) {
    return FleetAttributes.getHp(fleetId) < FleetAttributes.getMaxHp(fleetId);
  }
}
