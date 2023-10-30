// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { EObjectives } from "src/Types.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibObjectives } from "libraries/LibObjectives.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

contract OnClaimObjective_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks for destroy requirements before the building is removed.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the coordinates of the building to be destroyed.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Decode the coordinates from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    EObjectives objective = abi.decode(args, (EObjectives));

    // Get the player's entity and check destroy requirements
    bytes32 playerEntity = addressToEntity(msgSender);
    LibObjectives.checkObjectiveRequirements(playerEntity, objective);
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
