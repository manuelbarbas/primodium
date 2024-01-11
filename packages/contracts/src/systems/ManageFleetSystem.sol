// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { ESendType, SendArgs, Arrival } from "src/Types.sol";
import { ReversePosition, PositionData, UnitCount } from "codegen/index.sol";
import { LibFleet } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract ManageFleetSystem is PrimodiumSystem {
  function createFleet(
    bytes32 spaceRock,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public returns (bytes32 fleetId) {
    fleetId = LibFleet.createFleet(_player(false), spaceRock, unitCounts, resourceCounts);
  }

  function transferUnitsFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) public {
    LibFleet.transferUnitsFromFleetToFleet(_player(false), fromFleetId, fleetId, unitCounts);
  }

  function transferResourcesFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleet.transferResourcesFromFleetToFleet(_player(false), fromFleetId, fleetId, resourceCounts);
  }

  function transferUnitsFromSpaceRockToFleet(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) public {
    LibFleet.transferUnitsFromSpaceRockToFleet(_player(false), spaceRock, fleetId, unitCounts);
  }

  function transferUnitsFromFleetToSpaceRock(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) public {
    LibFleet.transferUnitsFromFleetToSpaceRock(_player(false), spaceRock, fleetId, unitCounts);
  }

  function transferResourcesFromSpaceRockToFleet(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleet.transferResourcesFromSpaceRockToFleet(_player(false), spaceRock, fleetId, resourceCounts);
  }

  function transferResourcesFromFleetToSpaceRock(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleet.transferResourcesFromFleetToSpaceRock(_player(false), spaceRock, fleetId, resourceCounts);
  }

  function transferUnitsAndResourcesFromFleetToSpaceRock(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleet.transferUnitsAndResourcesFromFleetToSpaceRock(
      _player(false),
      spaceRock,
      fleetId,
      unitCounts,
      resourceCounts
    );
  }

  function transferUnitsAndResourcesFromSpaceRockToFleet(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleet.transferUnitsAndResourcesFromSpaceRockToFleet(
      _player(false),
      spaceRock,
      fleetId,
      unitCounts,
      resourceCounts
    );
  }

  function transferUnitsAndResourcesFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleet.transferUnitsAndResourcesFromFleetToFleet(
      _player(false),
      fromFleetId,
      fleetId,
      unitCounts,
      resourceCounts
    );
  }

  function landFleet(bytes32 fleetId, bytes32 spaceRock) public {
    LibFleet.landFleet(_player(false), fleetId, spaceRock);
  }

  function mergeFleets(bytes32[] calldata fleets) public {
    LibFleet.mergeFleets(_player(false), fleets);
  }

  function recallFleet(bytes32 fleetId) public {
    LibFleet.recallFleet(_player(false), fleetId);
  }

  function sendFleets(bytes32[] calldata fleets, bytes32 spaceRock) public {
    LibFleet.sendFleets(_player(false), fleets, spaceRock);
  }

  function sendFleet(bytes32 fleetId, bytes32 spaceRock) public {
    LibFleet.sendFleet(_player(false), fleetId, spaceRock);
  }
}
