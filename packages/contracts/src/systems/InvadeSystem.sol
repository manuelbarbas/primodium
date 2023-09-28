// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { PrimodiumSystem } from "systems/internal/PrimodiumSystem.sol";

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemCall } from "@latticexyz/world/src/SystemCall.sol";

import { OwnedBy } from "codegen/index.sol";
import { LibInvade } from "codegen/Libraries.sol";

import { S_UpdateRockSystem } from "systems/subsystems/S_UpdateRockSystem.sol";

contract InvadeSystem is PrimodiumSystem {
  /**
   * @dev Initiates an invasion of a rock entity using the LibInvade library.
   * @param rockEntity The identifier of the target rock entity.
   */
  function invade(bytes32 rockEntity) public {
    bytes32 playerEntity = addressToEntity(_msgSender());
    if (OwnedBy.get(rockEntity) != 0) {
      SystemCall.callWithHooksOrRevert(
        entityToAddress(playerEntity),
        getSystemResourceId("S_UpdateRockSystem"),
        abi.encodeCall(S_UpdateRockSystem.updateRock, (playerEntity, rockEntity)),
        0
      );
    }
    LibInvade.invade(playerEntity, rockEntity);
  }
}
