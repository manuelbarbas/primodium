// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibSend } from "libraries/LibSend.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

import { SendArgs } from "src/Types.sol";

/**
 * @title OnSendUnits_UnitCount
 * @dev This contract is a system hook that updates the unit count when units are sent by a player.
 */
contract OnSendUnits_UnitCount is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It updates the unit count when units are sent by a player.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system, including the parameters of the send units function.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the parameters of the send units function
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    SendArgs memory sendArgs = abi.decode(args, (SendArgs));

    // Convert the message sender's address to their entity
    bytes32 playerEntity = _player(msgSender, false);

    // Update the unit count when units are sent
    LibSend.updateUnitCountOnSend(playerEntity, sendArgs);
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
