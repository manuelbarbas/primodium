// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { IWorld } from "codegen/world/IWorld.sol";
import { LibInvade } from "codegen/Libraries.sol";

contract InvadeSystem is PrimodiumSystem {
  /**
   * @dev Initiates an invasion of a rock entity using the LibInvade library.
   * @param rockEntity The identifier of the target rock entity.
   */
  function invade(bytes32 rockEntity) public _claimResources(rockEntity) _claimUnits(rockEntity) {
    LibInvade.invade(_player(), rockEntity);
  }
}
