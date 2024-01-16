// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";

import { ObjectiveKey } from "src/Keys.sol";
import { LibReward } from "libraries/LibReward.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

contract OnClaimObjective_ReceiveRewards is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed. It doesn't perform any specific actions in this case.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the coordinates from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    uint8 objective = abi.decode(args, (uint8));

    // Get the player's entity and check destroy requirements
    bytes32 playerEntity = _player(msgSender);
    bytes32 objectivePrototype = P_EnumToPrototype.get(ObjectiveKey, objective);
    LibReward.receiveRewards(playerEntity, objectivePrototype);
  }
}
