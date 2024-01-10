// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { EObjectives } from "src/Types.sol";
import { LibObjectives } from "libraries/LibObjectives.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

contract OnClaimObjective_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks for destroy requirements before the building is removed.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system, including the coordinates of the building to be destroyed.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public view {
    // Decode the coordinates from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    EObjectives objective = abi.decode(args, (EObjectives));

    // Get the player's entity and check destroy requirements
    bytes32 playerEntity = _player(msgSender, false);
    LibObjectives.checkObjectiveRequirements(playerEntity, objective);
  }

  /**
   * @dev This function is called after the system's main logic is executed. It doesn't perform any specific actions in this case.
   */
  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
