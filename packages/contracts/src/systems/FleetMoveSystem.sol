// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleetMove } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract FleetMoveSystem is PrimodiumSystem {
  function recallFleet(bytes32 fleetId) public {
    LibFleetMove.recallFleet(_player(false), fleetId);
  }

  function sendFleet(bytes32 fleetId, bytes32 spaceRock) public {
    LibFleetMove.sendFleet(_player(false), fleetId, spaceRock);
  }
}
