// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract MoveFleetSystem is PrimodiumSystem {
  function recallFleet(bytes32 fleetId) public {
    LibFleet.recallFleet(_player(false), fleetId);
  }

  function sendFleets(bytes32[] calldata fleets, bytes32 spaceRock) public {
    LibFleet.sendFleets(_player(false), fleets, spaceRock);
  }

  function sendFleet(bytes32 fleetId, bytes32 spaceRock) public {
    LibFleet.sendFleet(_player(false), fleetId, spaceRock);
  }
}
