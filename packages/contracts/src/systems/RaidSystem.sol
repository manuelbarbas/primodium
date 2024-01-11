// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { LibRaid } from "codegen/Libraries.sol";

contract RaidSystem is PrimodiumSystem {
  /**
   * @dev Initiates a raid on a rock entity using the LibRaid library.
   * @param rockEntity The identifier of the target rock entity.
   */
  function raid(bytes32 rockEntity) public {
    bytes32 playerEntity = _player(false);

    LibRaid.raid(playerEntity, rockEntity);
  }
}
