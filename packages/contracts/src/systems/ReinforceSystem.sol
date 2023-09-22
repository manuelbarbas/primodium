// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { System } from "@latticexyz/world/src/System.sol";
import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { LibReinforce } from "codegen/Libraries.sol";

import { OwnedBy } from "codegen/tables.sol";

contract ReinforceSystem is PrimodiumSystem {
  function reinforce(bytes32 rockEntity, bytes32 arrival) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    IWorld world = IWorld(_world());

    require(OwnedBy.get(rockEntity) == playerEntity, "[Reinforce] Rock not owned by sender");
    world.updateRock(playerEntity, rockEntity);

    LibReinforce.reinforce(playerEntity, rockEntity, arrival);
  }

  function recallAll(bytes32 rockEntity) public {
    LibReinforce.recallAllReinforcements(addressToEntity(_msgSender()), rockEntity);
  }

  function recall(bytes32 rockEntity, bytes32 arrivalEntity) public {
    LibReinforce.recallReinforcement(addressToEntity(_msgSender()), rockEntity, arrivalEntity);
  }
}
