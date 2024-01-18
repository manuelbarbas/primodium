// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetLandSystem is FleetBaseSystem {
  function landFleet(bytes32 fleetId, bytes32 spaceRock)
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenFleetIsInOrbitOfSpaceRock(fleetId, spaceRock)
    _claimResources(spaceRock)
    _claimUnits(spaceRock)
  {
    LibFleet.landFleet(_player(), fleetId, spaceRock);
  }
}
