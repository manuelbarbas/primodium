// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { EResource } from "src/Types.sol";
import { P_Transportables, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, GracePeriod, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { LibFleetAttributes } from "libraries/fleet/LibFleetAttributes.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetTransfer {
  function transferUnitsFromSpaceRockToFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 rockUnitCount = UnitCount.get(spaceRock, unitPrototypes[i]);
      require(rockUnitCount >= unitCounts[i], "[Fleet] Not enough units on space rock to add to fleet");
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], !isOwner);
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !isOwner);
    }
  }

  function transferResourcesFromSpaceRockToFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 rockResourceCount = ResourceCount.get(spaceRock, transportables[i]);
      require(rockResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.decreaseStoredResource(spaceRock, transportables[i], resourceCounts[i]);
      LibFleet.increaseFleetResource(fleetId, transportables[i], resourceCounts[i]);
    }
  }

  function transferUnitsAndResourcesFromSpaceRockToFleet(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bool isOwner = OwnedBy.get(fleetId) == spaceRock;

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !isOwner);
    }

    transferResourcesFromSpaceRockToFleet(playerEntity, spaceRock, fleetId, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      LibUnit.decreaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], !isOwner);
    }
  }

  function transferUnitsFromFleetToSpaceRock(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to remove from fleet");
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], !isOwner);
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !isOwner);
    }

    uint256 cargo = LibFleetAttributes.getCargo(fleetId);
    uint256 occupiedCargo = LibFleetAttributes.getOccupiedCargo(fleetId);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");
  }

  function transferResourcesFromFleetToSpaceRock(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 fleetResourceCount = ResourceCount.get(fleetId, transportables[i]);
      require(fleetResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to add to fleet");
      LibStorage.increaseStoredResource(spaceRock, transportables[i], resourceCounts[i]);
      LibFleet.decreaseFleetResource(fleetId, transportables[i], resourceCounts[i]);
    }
  }

  //this is required so unit cargo space can be updated correctly without loss of resources
  function transferUnitsAndResourcesFromFleetToSpaceRock(
    bytes32 playerEntity,
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    bool isOwner = OwnedBy.get(fleetId) == spaceRock;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      LibUnit.increaseUnitCount(spaceRock, unitPrototypes[i], unitCounts[i], !isOwner);
    }

    transferResourcesFromFleetToSpaceRock(playerEntity, spaceRock, fleetId, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to remove from fleet");
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !isOwner);
    }

    uint256 cargo = LibFleetAttributes.getCargo(fleetId);
    uint256 occupiedCargo = LibFleetAttributes.getOccupiedCargo(fleetId);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");
  }

  function transferUnitsFromFleetToFleet(
    bytes32 playerEntity,
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetId) == OwnedBy.get(fromFleetId);
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibFleet.decreaseFleetUnit(fromFleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibFleetAttributes.getCargo(fromFleetId);
    uint256 occupiedCargo = LibFleetAttributes.getOccupiedCargo(fromFleetId);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");
  }

  function transferResourcesFromFleetToFleet(
    bytes32 playerEntity,
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibFleet.increaseFleetResource(fleetId, transportables[i], resourceCounts[i]);
      LibFleet.decreaseFleetResource(fromFleetId, transportables[i], resourceCounts[i]);
    }
  }

  function transferUnitsAndResourcesFromFleetToFleet(
    bytes32 playerEntity,
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetId) == OwnedBy.get(fromFleetId);
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromFleetToFleet(playerEntity, fromFleetId, fleetId, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      uint256 fleetUnitCount = UnitCount.get(fromFleetId, unitPrototypes[i]);
      LibFleet.decreaseFleetUnit(fromFleetId, unitPrototypes[i], fleetUnitCount, !sameOwner);
    }

    uint256 cargo = LibFleetAttributes.getCargo(fromFleetId);
    uint256 occupiedCargo = LibFleetAttributes.getOccupiedCargo(fromFleetId);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");
  }
}
