// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibFleet } from "codegen/Libraries.sol";
import { NUM_UNITS, NUM_RESOURCE } from "src/constants.sol";

contract MergeFleetSystem is PrimodiumSystem {
  function mergeFleets(bytes32[] calldata fleets) public {
    LibFleet.mergeFleets(_player(false), fleets);
  }
}
