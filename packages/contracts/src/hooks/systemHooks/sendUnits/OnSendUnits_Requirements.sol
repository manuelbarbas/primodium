// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibEncode, LibMotherlode, LibSend } from "codegen/Libraries.sol";
import { LibSend } from "libraries/LibSend.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { ReversePosition } from "codegen/tables/ReversePosition.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { ESendType, SendArgs, ERock } from "src/Types.sol";

/**
 * @title OnSendUnits_Requirements
 * @dev This contract is a system hook that checks movement rules for units before they are sent to a destination.
 */
contract OnSendUnits_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks the movement rules for units before they are sent to a destination.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the parameters of the send units function.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Decode the parameters of the send units function
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    SendArgs memory sendArgs = abi.decode(args, (SendArgs));

    // Convert origin and destination coordinates to their corresponding entities
    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bytes32 destination = ReversePosition.get(sendArgs.destinationPosition.x, sendArgs.destinationPosition.y);
    if (destination == 0) destination = LibMotherlode.createMotherlode(sendArgs.destinationPosition);

    // Convert the message sender's address to their entity
    bytes32 playerEntity = addressToEntity(msgSender);

    // Check the movement rules for sending units
    LibSend.checkMovementRules(origin, destination, playerEntity, sendArgs.to, sendArgs.sendType);
  }

  /**
   * @dev This function is called after the system's main logic is executed. It doesn't perform any specific actions in this case.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // This function doesn't perform any actions in this case.
  }
}
