// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ESendType, Arrival, ERock, EResource } from "src/Types.sol";
import { FleetStatusData, FleetStatus, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, RockType, PositionData, P_Unit, UnitLevel, P_GameConfig, P_GameConfigData, ArrivalCount, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { ArrivalsMap } from "libraries/ArrivalsMap.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { SendArgs } from "src/Types.sol";
import { FleetKey } from "src/Keys.sol";
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
    fleetId = LibEncode.getTimedHash(playerEntity, FleetKey);
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      uint256 rockUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      require(rockUnitCount >= unitCounts[i], "[Fleet] Not enough units to add to fleet");
      UnitCount.set(fleetId, unitPrototypes[i], unitCounts[i]);
      UnitCount.set(spaceRock, unitPrototypes[i], rockUnitCount - unitCounts[i]);
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
    require(OwnedBy.get(spaceRock) == playerEntity, "[Fleet] Can only land fleet on owned space rock");
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    for (uint256 i = 0; i < unitPrototypes.length; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      if (fleetUnitCount == 0) continue;
      uint256 rockUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      UnitCount.set(spaceRock, unitPrototypes[i], rockUnitCount + fleetUnitCount);
      UnitCount.set(fleetId, unitPrototypes[i], 0);
    }

    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      uint256 fleetResourceCount = ResourceCount.get(fleetId, i);
      if (fleetResourceCount == 0) continue;

      uint256 rockResourceCount = ResourceCount.get(spaceRock, i);

      LibStorage.increaseStoredResource(spaceRock, i, fleetResourceCount);
      decreaseFleetResource(fleetId, i, fleetResourceCount);
    }
  }
}
