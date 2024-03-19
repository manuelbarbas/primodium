// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleet } from "libraries/fleet/LibFleet.sol";

contract FleetLandSystem is FleetBaseSystem {
  function landFleet(
    bytes32 fleetId,
    bytes32 asteroidEntity
  )
    public
    _onlyFleetOwner(fleetId)
    _onlyWhenNotInCooldown(fleetId)
    _onlyWhenFleetIsInOrbitOfAsteroid(fleetId, asteroidEntity)
    _onlyWhenNotPirateAsteroid(asteroidEntity)
    _claimResources(asteroidEntity)
    _claimUnits(asteroidEntity)
  {
    LibFleet.landFleet(_player(), fleetId, asteroidEntity);
  }
}
