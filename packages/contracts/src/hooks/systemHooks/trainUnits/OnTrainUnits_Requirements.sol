// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { EUnit } from "src/Types.sol";

/**
 * @title OnTrainUnits_Requirements
 * @dev This contract is a system hook that checks the requirements for training units.
 */
contract OnTrainUnits_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks the requirements for training units.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system, including the parameters of the train units function.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the parameters of the train units function
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    (bytes32 buildingEntity, EUnit unit, uint256 count) = abi.decode(args, (bytes32, EUnit, uint256));

    // Convert the message sender's address to their entity
    bytes32 playerEntity = _player(msgSender, false);

    // Check the requirements for training units
    LibUnit.checkTrainUnitsRequirements(buildingEntity, unit);
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
