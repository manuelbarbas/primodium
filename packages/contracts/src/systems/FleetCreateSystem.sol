// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetCreateSystem is FleetBaseSystem {
  function createFleet(
    bytes32 spaceRock,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public _claimResources(spaceRock) _claimUnits(spaceRock) _onlySpaceRockOwner(spaceRock) returns (bytes32 fleetId) {
    fleetId = LibFleet.createFleet(_player(), spaceRock, unitCounts, resourceCounts);
  }
}
