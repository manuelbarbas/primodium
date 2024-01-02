// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibRaid } from "libraries/LibRaid.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnRaid_Requirements
 * @dev This contract is a system hook that checks raid requirements before initiating a raid on a space rock.
 */
contract OnRaid_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks the requirements for initiating a raid on a space rock.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system, including the identifier of the space rock.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public view {
    // Decode the space rock identifier and the player's entity from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    bytes32 rockEntity = abi.decode(args, (bytes32));
    bytes32 playerEntity = _player(msgSender, false);

    // Check the requirements for initiating a raid on the space rock
    LibRaid.checkRaidRequirements(playerEntity, rockEntity);
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
