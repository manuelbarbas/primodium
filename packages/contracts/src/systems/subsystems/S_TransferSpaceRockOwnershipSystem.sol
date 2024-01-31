// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { OwnedBy } from "src/codegen/index.sol";
import { LibFleetCombat } from "libraries/fleet/LibFleetCombat.sol";

contract S_TransferSpaceRockOwnershipSystem is PrimodiumSystem {
  function transferSpaceRockOwnership(bytes32 aggressorEntity, bytes32 targetEntity) public {
    LibFleetCombat.transferSpaceRockOwnership(targetEntity, OwnedBy.get(OwnedBy.get(aggressorEntity)));
  }
}
