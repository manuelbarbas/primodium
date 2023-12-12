// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibUnit } from "libraries/LibUnit.sol";

contract ClaimUnitsSystem is PrimodiumSystem {
  function claimUnits(bytes32 rockEntity) public {
    LibUnit.claimUnits(rockEntity);
  }
}
