// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { EResource } from "src/Types.sol";
import { P_Transportables, P_EnumToPrototype, FleetStance, FleetStanceData, Position, FleetMovementData, FleetMovement, Spawned, PirateAsteroid, DefeatedPirate, UnitCount, ReversePosition, PositionData, P_Unit, P_UnitData, UnitLevel, P_GameConfig, P_GameConfigData, ResourceCount, OwnedBy, P_UnitPrototypes } from "codegen/index.sol";
import { CapitalShipPrototypeId } from "codegen/Prototypes.sol";

import { LibMath } from "libraries/LibMath.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { LibCombatAttributes } from "libraries/LibCombatAttributes.sol";
import { FleetsMap } from "libraries/fleet/FleetsMap.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EUnit, EFleetStance } from "src/Types.sol";

library LibFleetTransfer {
  function transferUnitsFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetId,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetId) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibUnit.decreaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    LibFleet.checkAndSetFleetEmpty(fleetId);
  }

  function transferResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetId,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibStorage.decreaseStoredResource(asteroidEntity, transportables[i], resourceCounts[i]);
      LibFleet.increaseFleetResource(fleetId, transportables[i], resourceCounts[i]);
    }
  }

  function transferUnitsAndResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bool sameOwner = OwnedBy.get(fleetId) == asteroidEntity;

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromAsteroidToFleet(asteroidEntity, fleetId, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibUnit.decreaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    LibFleet.checkAndSetFleetEmpty(fleetId);
  }

  function transferUnitsFromFleetToAsteroid(
    bytes32 fleetId,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetId) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibUnit.increaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fleetId);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fleetId);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(fleetId);
  }

  function transferResourcesFromFleetToAsteroid(
    bytes32 fleetId,
    bytes32 asteroidEntity,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibStorage.increaseStoredResource(asteroidEntity, transportables[i], resourceCounts[i]);
      LibFleet.decreaseFleetResource(fleetId, transportables[i], resourceCounts[i]);
    }
  }

  //this is required so unit cargo space can be updated correctly without loss of resources
  function transferUnitsAndResourcesFromFleetToAsteroid(
    bytes32 fleetId,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    bool sameOwner = OwnedBy.get(fleetId) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibUnit.increaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromFleetToAsteroid(fleetId, asteroidEntity, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibFleet.decreaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fleetId);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fleetId);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(fleetId);
  }

  function transferUnitsFromFleetToFleet(bytes32 fromFleetId, bytes32 fleetId, uint256[] calldata unitCounts) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetId) == OwnedBy.get(fromFleetId);
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibFleet.decreaseFleetUnit(fromFleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fromFleetId);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fromFleetId);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    //set to fleet to not empty
    LibFleet.checkAndSetFleetEmpty(fromFleetId);
    LibFleet.checkAndSetFleetEmpty(fleetId);
  }

  function transferResourcesFromFleetToFleet(
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
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetId) == OwnedBy.get(fromFleetId);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibFleet.increaseFleetUnit(fleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromFleetToFleet(fromFleetId, fleetId, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibFleet.decreaseFleetUnit(fromFleetId, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fromFleetId);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fromFleetId);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(fleetId);
    LibFleet.checkAndSetFleetEmpty(fromFleetId);
  }
}
