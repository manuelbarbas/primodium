// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibSpaceRock } from "libraries/LibSpaceRock.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { ESendType, SendArgs, ERock, Arrival } from "src/Types.sol";

/**
 * @title OnTrainUnits_UpdateRock
 * @dev This contract is a system hook that updates the home rock when units are trained.
 */
contract OnTrainUnits_UpdateRock is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It updates the home rock of the player when units are trained.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the parameters of the train units function.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Update the home rock of the player
    bytes32 playerEntity = addressToEntity(msgSender);
    LibSpaceRock.updateHomeRock(playerEntity);
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
