// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract TransferFleetSystem is PrimodiumSystem {
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
}
