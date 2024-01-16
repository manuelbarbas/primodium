// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetTransfer } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetTransferSystem is PrimodiumSystem {
  function transferUnitsFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) public {
    LibFleetTransfer.transferUnitsFromFleetToFleet(_player(), fromFleetId, fleetId, unitCounts);
  }

  function transferResourcesFromFleetToFleet(
    bytes32 fromFleetId,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleetTransfer.transferResourcesFromFleetToFleet(_player(), fromFleetId, fleetId, resourceCounts);
  }

  function transferUnitsFromSpaceRockToFleet(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) public {
    LibFleetTransfer.transferUnitsFromSpaceRockToFleet(_player(), spaceRock, fleetId, unitCounts);
  }

  function transferUnitsFromFleetToSpaceRock(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts
  ) public {
    LibFleetTransfer.transferUnitsFromFleetToSpaceRock(_player(), spaceRock, fleetId, unitCounts);
  }

  function transferResourcesFromSpaceRockToFleet(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleetTransfer.transferResourcesFromSpaceRockToFleet(_player(), spaceRock, fleetId, resourceCounts);
  }

  function transferResourcesFromFleetToSpaceRock(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleetTransfer.transferResourcesFromFleetToSpaceRock(_player(), spaceRock, fleetId, resourceCounts);
  }

  function transferUnitsAndResourcesFromFleetToSpaceRock(
    bytes32 spaceRock,
    bytes32 fleetId,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public {
    LibFleetTransfer.transferUnitsAndResourcesFromFleetToSpaceRock(
      _player(),
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
    LibFleetTransfer.transferUnitsAndResourcesFromSpaceRockToFleet(
      _player(),
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
    LibFleetTransfer.transferUnitsAndResourcesFromFleetToFleet(
      _player(),
      fromFleetId,
      fleetId,
      unitCounts,
      resourceCounts
    );
  }
}
