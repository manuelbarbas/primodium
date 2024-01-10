// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibResource } from "libraries/LibResource.sol";
import { Home } from "codegen/index.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnBefore_ClaimResources
 * @dev This contract is a system hook that handles claiming resources
 */
contract OnBefore_ClaimResources is SystemHook {
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
    bytes32 playerEntity = _player(msgSender, false);
    LibResource.claimAllPlayerResources(playerEntity);
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
