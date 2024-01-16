// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { LibResource } from "libraries/LibResource.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnDestroy_ClaimResources
 * @dev This contract is a system hook that handles claiming resources when a building is upgraded in the game world.
 */
contract OnDestroy_ClaimResources is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed.
   * @param msgSender The address of the message sender.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory
  ) public {
    LibResource.claimAllResources(_player(msgSender));
  }

  /**
   * @dev This function is called after the system's main logic is executed.
   * It spends the required resources when a building is constructed.
   */
  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
