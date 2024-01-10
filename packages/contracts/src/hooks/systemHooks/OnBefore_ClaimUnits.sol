// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { Home } from "codegen/index.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnBefore_ClaimUnits
 * @dev This contract is a system hook that claims resources for player.
 */
contract OnBefore_ClaimUnits is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It updates information about the space rock after an invasion if it is owned.
   * @param msgSender The address of the message sender.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory
  ) public {
    // Get the player's entity
    bytes32 playerEntity = _player(msgSender, false);

    LibUnit.claimUnits(Home.getAsteroid(playerEntity));
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
