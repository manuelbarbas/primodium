// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { OwnedBy } from "src/codegen/index.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";

contract S_TransferSpaceRockOwnershipSystem is PrimodiumSystem {
  function transferSpaceRockOwnership(bytes32 spaceRock, bytes32 newOwner) public {
    LibFleetCombat.transferSpaceRockOwnership(spaceRock, newOwner);
  }
}
