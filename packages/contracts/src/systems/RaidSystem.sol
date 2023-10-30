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

  /**
   * @dev Initiates a recall of all raids of a rock entity using the LibRaid library.
   * @param rockEntity The identifier of the target rock entity.
   */
  function recallAllRaids(bytes32 rockEntity) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibRaid.recallAllRaids(playerEntity, rockEntity);
  }

  /**
   * @dev Initiates a recall of a raid of a rock entity using the LibRaid library.
   * @param rockEntity The identifier of the target rock entity.
   * @param arrivalId The id of the arrival to recalled.
   */
  function recallRaid(bytes32 rockEntity, bytes32 arrivalId) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibRaid.recallRaid(playerEntity, rockEntity, arrivalId);
  }
}
