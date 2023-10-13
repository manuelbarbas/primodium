// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { UnitKey } from "src/Keys.sol";
import { LibUnit } from "libraries/LibUnit.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { ESendType, SendArgs, ERock, Arrival, EUnit } from "src/Types.sol";

/**
 * @title OnTrainUnits_Requirements
 * @dev This contract is a system hook that checks the requirements for training units.
 */
contract OnTrainUnits_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks the requirements for training units.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the parameters of the train units function.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Decode the parameters of the train units function
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    (bytes32 buildingEntity, EUnit unit, uint256 count) = abi.decode(args, (bytes32, EUnit, uint256));

    // Convert the message sender's address to their entity
    bytes32 playerEntity = addressToEntity(msgSender);

    // Check the requirements for training units
    LibUnit.checkTrainUnitsRequirements(buildingEntity, unit);
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
