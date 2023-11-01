// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnUpgrade_Requirements
 * @dev This contract is a system hook that checks upgrade requirements before allowing an upgrade operation.
 */
contract OnUpgrade_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks upgrade requirements before the upgrade system is called.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the parameters of the upgrade function.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Decode the parameters from the call data
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    PositionData memory coord = abi.decode(args, (PositionData));

    // Get the player's entity
    bytes32 playerEntity = addressToEntity(msgSender);

    // Check the upgrade requirements
    LibBuilding.checkUpgradeRequirements(playerEntity, coord);
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
    // This function doesn't perform any actions after the system is called.
  }
}
