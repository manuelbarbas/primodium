// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibMotherlode } from "codegen/Libraries.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { ReversePosition } from "codegen/tables/ReversePosition.sol";
import { SendArgs } from "src/Types.sol";

/**
 * @title OnSendUnits_InitMotherlode
 * @dev This contract is a system hook that initializes a motherlode before sending
 */
contract OnSendUnits_InitMotherlode is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It initializes a motherlode if one doesnt exist yet.
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

    bytes32 origin = ReversePosition.get(sendArgs.originPosition.x, sendArgs.originPosition.y);
    bytes32 destination = ReversePosition.get(sendArgs.destinationPosition.x, sendArgs.destinationPosition.y);
    if (destination == 0) LibMotherlode.createMotherlode(sendArgs.destinationPosition);
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
