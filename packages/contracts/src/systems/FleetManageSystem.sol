// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleet } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetManageSystem is FleetBaseSystem {
  function createFleet(
    bytes32 spaceRock,
    uint256[NUM_UNITS] calldata unitCounts,
    uint256[NUM_RESOURCE] calldata resourceCounts
  ) public _onlySpaceRockOwner(spaceRock) returns (bytes32 fleetId) {
    fleetId = LibFleet.createFleet(_player(), spaceRock, unitCounts, resourceCounts);
  }

  function landFleet(bytes32 fleetId, bytes32 spaceRock)
    public
    _onlySpaceRockOwner(spaceRock)
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, spaceRock)
  {
    LibFleet.landFleet(_player(), fleetId, spaceRock);
  }
}
