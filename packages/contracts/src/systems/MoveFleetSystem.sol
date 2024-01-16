// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract MoveFleetSystem is PrimodiumSystem {
  function recallFleet(bytes32 fleetId) public {
    LibFleet.recallFleet(_player(), fleetId);
  }

  function sendFleet(bytes32 fleetId, bytes32 spaceRock) public {
    LibFleet.sendFleet(_player(), fleetId, spaceRock);
  }
}
