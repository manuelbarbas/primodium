// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { System } from "@latticexyz/world/src/System.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { LibReinforce } from "codegen/Libraries.sol";

import { OwnedBy } from "codegen/index.sol";

contract ReinforceSystem is PrimodiumSystem {
  /**
   * @dev Initiates reinforcement of a player's owned rock entity using the LibReinforce library.
   * @param rockEntity The identifier of the target rock entity.
   * @param arrival The identifier of the arrival used for reinforcement.
   */
  function reinforce(bytes32 rockEntity, bytes32 arrival) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    IWorld world = IWorld(_world());

    require(OwnedBy.get(rockEntity) == playerEntity, "[Reinforce] Rock not owned by sender");
    world.updateRock(playerEntity, rockEntity);

    LibReinforce.reinforce(playerEntity, rockEntity, arrival);
  }

  /**
   * @dev Recalls all reinforcements sent by the sender to a specific rock entity.
   * @param rockEntity The identifier of the target rock entity.
   */
  function recallAll(bytes32 rockEntity) public {
    LibReinforce.recallAllReinforcements(addressToEntity(_msgSender()), rockEntity);
  }

  /**
   * @dev Recalls a specific reinforcement sent by the sender to a rock entity.
   * @param rockEntity The identifier of the target rock entity.
   * @param arrivalEntity The identifier of the arrival to recall.
   */
  function recall(bytes32 rockEntity, bytes32 arrivalEntity) public {
    LibReinforce.recallReinforcement(addressToEntity(_msgSender()), rockEntity, arrivalEntity);
  }
}
