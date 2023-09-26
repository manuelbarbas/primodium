// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { OwnedBy } from "codegen/Tables.sol";
import { LibInvade } from "codegen/Libraries.sol";

contract InvadeSystem is PrimodiumSystem {
  /**
   * @dev Initiates an invasion of a rock entity using the LibInvade library.
   * @param rockEntity The identifier of the target rock entity.
   */
  function invade(bytes32 rockEntity) public {
    IWorld world = IWorld(_world());
    bytes32 playerEntity = addressToEntity(_msgSender());
    if (OwnedBy.get(rockEntity) != 0) {
      world.updateRock(playerEntity, rockEntity);
    }
    LibInvade.invade(world, playerEntity, rockEntity);
  }
}
