// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { LibInvade } from "libraries/LibInvade.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnInvade_Requirements
 * @dev This contract is a system hook that checks if there are any requirements before invading a resource or area in the game world.
 */
contract OnInvade_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks for invade requirements before invading the resource or area.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system, including the identifier of the resource or area to invade.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the resource or area identifier from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    bytes32 rockEntity = abi.decode(args, (bytes32));

    // Get the player's entity and check invade requirements
    bytes32 playerEntity = _player(msgSender, false);
    LibInvade.checkInvadeRequirements(playerEntity, rockEntity);
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
