// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";

import { LibBuilding } from "libraries/LibBuilding.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnDestroy_Requirements
 * @dev This contract is a system hook that checks if there are any requirements before destroying a building in the game world.
 */
contract OnDestroy_Requirements is SystemHook {
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
    PositionData memory coord = abi.decode(args, (PositionData));

    // Get the player's entity and check destroy requirements
    bytes32 playerEntity = _player(msgSender, false);
    LibBuilding.checkDestroyRequirements(playerEntity, coord);
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
