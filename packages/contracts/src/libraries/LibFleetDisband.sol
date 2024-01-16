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
import { LibFleetStance } from "libraries/LibFleetStance.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, NUM_UNITS, UNIT_SPEED_SCALE, NUM_RESOURCE } from "src/constants.sol";
import { EResource, EFleetStance } from "src/Types.sol";

library LibFleetDisband {
  function disbandFleet(bytes32 playerEntity, bytes32 fleetId) internal {
    bytes32 ownerSpaceRock = OwnedBy.get(fleetId);

    //remove resources
    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      ResourceCount.deleteRecord(fleetId, i);
    }

    //remove units and return utility to space rock
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      uint256 unitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      if (unitCount == 0) continue;
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], unitCount, true);
    }

    //remove followers
    LibFleetStance.clearFollowingFleets(fleetId);

    //remove stance
    LibFleetStance.clearFleetStance(playerEntity, fleetId);

    //remove fleet from incoming
    FleetsMap.remove(FleetMovement.getDestination(fleetId), FleetIncomingKey, fleetId);

    //reset attributes
    FleetAttributes.set(
      fleetId,
      FleetAttributesData({
        speed: 0,
        attack: 0,
        defense: 0,
        cargo: 0,
        occupiedCargo: 0,
        hp: 0,
        maxHp: 0,
        encryption: 0
      })
    );

    //reset fleet position
    FleetMovement.set(
      fleetId,
      FleetMovementData({
        arrivalTime: block.timestamp,
        sendTime: block.timestamp,
        origin: OwnedBy.get(fleetId),
        destination: OwnedBy.get(fleetId)
      })
    );

    //set fleet in orbit of owner space rock
    FleetsMap.add(OwnedBy.get(fleetId), FleetIncomingKey, fleetId);
  }

  function disbandUnitsAndResourcesFromFleet(
    bytes32 playerEntity,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    disbandResources(playerEntity, fleetId, resourceCounts);
    disbandUnits(playerEntity, fleetId, unitCounts);
  }

  function disbandUnits(
    bytes32 playerEntity,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < NUM_UNITS; i++) {
      if (unitCounts[i] == 0) continue;
      uint256 fleetUnitCount = UnitCount.get(fleetId, unitPrototypes[i]);
      require(fleetUnitCount >= unitCounts[i], "[Fleet] Not enough units to disband from fleet");
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], true);
    }
  }

  function disbandResources(
    bytes32 playerEntity,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) internal {
    for (uint8 i = 0; i < NUM_RESOURCE; i++) {
      if (resourceCounts[i] == 0) continue;
      uint256 fleetResourceCount = ResourceCount.get(fleetId, i);
      require(fleetResourceCount >= resourceCounts[i], "[Fleet] Not enough resources to disband from fleet");
      LibFleet.decreaseFleetResource(fleetId, i, resourceCounts[i]);
    }
  }
}
