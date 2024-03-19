// SPDX-License-Identifier: MIT
pragma solidity >=0.8.24;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { FleetMovement } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { PirateAsteroid, Asteroid, PositionData, ReversePosition } from "codegen/index.sol";

contract FleetRecallSystem is PrimodiumSystem {
  modifier _onlyWhenOriginIsNotPirateAsteroid(bytes32 fleetId) {
    require(
      !PirateAsteroid.getIsPirateAsteroid(FleetMovement.getOrigin(fleetId)),
      "[Fleet] Can not recall fleet sent from pirate asteroid"
    );
    _;
  }

  function recallFleet(
    bytes32 fleetId
  ) public _onlyFleetOwner(fleetId) _onlyWhenOriginIsNotPirateAsteroid(fleetId) _onlyWhenNotInStance(fleetId) {
    LibFleetMove.recallFleet(fleetId);
  }
}
