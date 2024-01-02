// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";

import { EBuilding } from "src/Types.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnBuild_Requirements
 * @dev This contract is a system hook that checks building requirements before it is constructed in the game world.
 */
contract OnBuild_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks building requirements before construction.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    (EBuilding buildingType, PositionData memory coord) = abi.decode(args, (EBuilding, PositionData));

    // Convert the player's address to an entity
    bytes32 playerEntity = _player(msgSender, false);

    // Check building requirements for construction
    LibBuilding.checkBuildRequirements(playerEntity, buildingType, coord);
  }

  /**
   * @dev This function is called after the system's main logic is executed.
   * It does not perform any actions in this case.
   */
  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {
    // This function does not perform any actions in this case.
  }
}
