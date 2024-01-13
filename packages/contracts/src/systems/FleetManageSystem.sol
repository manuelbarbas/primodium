// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetManageSystem is PrimodiumSystem {
  function createFleet(
    bytes32 spaceRock,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public returns (bytes32 fleetId) {
    fleetId = LibFleet.createFleet(_player(false), spaceRock, unitCounts, resourceCounts);
  }

  function landFleet(bytes32 fleetId, bytes32 spaceRock) public {
    LibFleet.landFleet(_player(false), fleetId, spaceRock);
  }
}
