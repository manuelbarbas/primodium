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
import { FleetSet } from "libraries/fleet/FleetSet.sol";
import { FleetKey, FleetOwnedByKey, FleetIncomingKey, FleetStanceKey } from "src/Keys.sol";

import { WORLD_SPEED_SCALE, UNIT_SPEED_SCALE } from "src/constants.sol";
import { EResource, EUnit, EFleetStance } from "src/Types.sol";

library LibFleetTransfer {
  function transferUnitsFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetEntity) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibUnit.decreaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibFleet.increaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  function transferResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibStorage.decreaseStoredResource(asteroidEntity, transportables[i], resourceCounts[i]);
      LibFleet.increaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
    }
  }

  function transferUnitsAndResourcesFromAsteroidToFleet(
    bytes32 asteroidEntity,
    bytes32 fleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bool sameOwner = OwnedBy.get(fleetEntity) == asteroidEntity;

    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibFleet.increaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromAsteroidToFleet(asteroidEntity, fleetEntity, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibUnit.decreaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  function transferUnitsFromFleetToAsteroid(
    bytes32 fleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetEntity) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibFleet.decreaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibUnit.increaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fleetEntity);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  function transferResourcesFromFleetToAsteroid(
    bytes32 fleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibStorage.increaseStoredResource(asteroidEntity, transportables[i], resourceCounts[i]);
      LibFleet.decreaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
    }
  }

  //this is required so unit cargo space can be updated correctly without loss of resources
  function transferUnitsAndResourcesFromFleetToAsteroid(
    bytes32 fleetEntity,
    bytes32 asteroidEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();

    bool sameOwner = OwnedBy.get(fleetEntity) == asteroidEntity;
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibUnit.increaseUnitCount(asteroidEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromFleetToAsteroid(fleetEntity, asteroidEntity, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibFleet.decreaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fleetEntity);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  function transferUnitsFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 fleetEntity,
    uint256[] calldata unitCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetEntity) == OwnedBy.get(fromFleetEntity);
    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibFleet.increaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
      LibFleet.decreaseFleetUnit(fromFleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fromFleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fromFleetEntity);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    //set to fleet to not empty
    LibFleet.checkAndSetFleetEmpty(fromFleetEntity);
    LibFleet.checkAndSetFleetEmpty(fleetEntity);
  }

  function transferResourcesFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 fleetEntity,
    uint256[] calldata resourceCounts
  ) internal {
    uint8[] memory transportables = P_Transportables.get();
    for (uint8 i = 0; i < transportables.length; i++) {
      if (resourceCounts[i] == 0) continue;
      LibFleet.increaseFleetResource(fleetEntity, transportables[i], resourceCounts[i]);
      LibFleet.decreaseFleetResource(fromFleetEntity, transportables[i], resourceCounts[i]);
    }
  }

  function transferUnitsAndResourcesFromFleetToFleet(
    bytes32 fromFleetEntity,
    bytes32 fleetEntity,
    uint256[] calldata unitCounts,
    uint256[] calldata resourceCounts
  ) internal {
    bytes32[] memory unitPrototypes = P_UnitPrototypes.get();
    bool sameOwner = OwnedBy.get(fleetEntity) == OwnedBy.get(fromFleetEntity);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      if (!sameOwner && unitPrototypes[i] == CapitalShipPrototypeId)
        revert("[Fleet] Cannot transfer capital ships to other players");
      LibFleet.increaseFleetUnit(fleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    transferResourcesFromFleetToFleet(fromFleetEntity, fleetEntity, resourceCounts);

    for (uint8 i = 0; i < unitPrototypes.length; i++) {
      if (unitCounts[i] == 0) continue;
      LibFleet.decreaseFleetUnit(fromFleetEntity, unitPrototypes[i], unitCounts[i], !sameOwner);
    }

    uint256 cargo = LibCombatAttributes.getCargoCapacity(fromFleetEntity);
    uint256 occupiedCargo = LibCombatAttributes.getCargo(fromFleetEntity);
    require(cargo >= occupiedCargo, "[Fleet] Not enough cargo space to transfer units");

    LibFleet.checkAndSetFleetEmpty(fleetEntity);
    LibFleet.checkAndSetFleetEmpty(fromFleetEntity);
  }
}
