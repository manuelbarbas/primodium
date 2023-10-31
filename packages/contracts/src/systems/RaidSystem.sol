// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";
import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { IWorld } from "codegen/world/IWorld.sol";

import { OwnedBy } from "codegen/index.sol";
import { LibRaid } from "codegen/Libraries.sol";

contract RaidSystem is PrimodiumSystem {
  /**
   * @dev Initiates a raid on a rock entity using the LibRaid library.
   * @param rockEntity The identifier of the target rock entity.
   */
  function raid(bytes32 rockEntity) public {
    bytes32 playerEntity = addressToEntity(_msgSender());

    LibRaid.raid(IWorld(_world()), playerEntity, rockEntity);
  }
}
