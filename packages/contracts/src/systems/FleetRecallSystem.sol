// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { FleetBaseSystem } from "systems/internal/FleetBaseSystem.sol";
import { LibFleetMove } from "libraries/fleet/LibFleetMove.sol";
import { FleetMovement } from "codegen/index.sol";
import { LibAsteroid } from "libraries/LibAsteroid.sol";
import { createSecondaryAsteroid } from "libraries/SubsystemCalls.sol";
import { PirateAsteroid, Asteroid, PositionData, ReversePosition } from "codegen/index.sol";

contract FleetRecallSystem is FleetBaseSystem {
  function recallFleet(bytes32 fleetId) public _onlyFleetOwner(fleetId) {
    LibFleetMove.recallFleet(fleetId);
  }
}
