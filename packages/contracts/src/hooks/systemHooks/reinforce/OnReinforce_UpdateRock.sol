// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibSpaceRock } from "libraries/LibSpaceRock.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { ESendType, SendArgs, ERock, Arrival } from "src/Types.sol";
import { OwnedBy } from "codegen/tables/OwnedBy.sol";

/**
 * @title OnReinforce_UpdateRock
 * @dev This contract is a system hook that updates a space rock's status before reinforcing it.
 */
contract OnReinforce_UpdateRock is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It updates the status of a space rock if it's owned by a player and is being reinforced.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the parameters of the reinforcement function.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Extract the function selector from the call data
    bytes memory functionSelector = SliceInstance.toBytes(SliceLib.getSubslice(callData, 0, 4));

    // Check if the function being called is "reinforce(uint256,uint256)"
    if (keccak256(functionSelector) != keccak256("reinforce(uint256,uint256)")) {
      return;
    }

    // Decode the player's entity from the message sender's address
    bytes32 playerEntity = addressToEntity(msgSender);

    // Decode the parameters of the reinforce function
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    (bytes32 rockEntity, bytes32 arrival) = abi.decode(args, (bytes32, bytes32));

    // Check if the space rock is owned by a player, and if so, update its status
    if (OwnedBy.get(rockEntity) != 0) {
      LibSpaceRock.updateRock(playerEntity, rockEntity);
    }
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
