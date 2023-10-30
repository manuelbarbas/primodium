// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { IWorld } from "codegen/world/IWorld.sol";
import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";

import { OwnedBy } from "codegen/index.sol";
import { LibInvade } from "codegen/Libraries.sol";

contract InvadeSystem is PrimodiumSystem {
  /**
   * @dev Initiates an invasion of a rock entity using the LibInvade library.
   * @param rockEntity The identifier of the target rock entity.
   */
  function invade(bytes32 rockEntity) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibInvade.invade(IWorld(_world()), playerEntity, rockEntity);
  }

  /**
   * @dev Initiates a recall of all invasions of a rock entity using the LibInvade library.
   * @param rockEntity The identifier of the target rock entity.
   */
  function recallAllInvades(bytes32 rockEntity) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibInvade.recallAllInvades(playerEntity, rockEntity);
  }

  /**
   * @dev Initiates a recall of an invasion of a rock entity using the LibInvade library.
   * @param rockEntity The identifier of the target rock entity.
   * @param arrivalId The id of the arrival to recalled.
   */
  function recallInvade(bytes32 rockEntity, bytes32 arrivalId) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    LibInvade.recallInvade(playerEntity, rockEntity, arrivalId);
  }
}
