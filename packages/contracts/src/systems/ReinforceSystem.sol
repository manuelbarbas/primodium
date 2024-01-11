// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { LibReinforce } from "codegen/Libraries.sol";

import { OwnedBy } from "codegen/index.sol";

contract ReinforceSystem is PrimodiumSystem {
  /**
   * @dev Initiates reinforcement of a player's owned rock entity using the LibReinforce library.
   * @param rockEntity The identifier of the target rock entity.
   * @param arrival The identifier of the arrival used for reinforcement.
   */
  function reinforce(bytes32 rockEntity, bytes32 arrival) public {
    bytes32 playerEntity = _player();

    require(OwnedBy.get(rockEntity) == playerEntity, "[Reinforce] Rock not owned by sender");

    LibReinforce.reinforce(playerEntity, rockEntity, arrival);
  }
}
