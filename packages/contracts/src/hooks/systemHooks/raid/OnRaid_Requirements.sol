// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibRaid } from "libraries/LibRaid.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { ESendType, SendArgs, ERock } from "src/Types.sol";

/**
 * @title OnRaid_Requirements
 * @dev This contract is a system hook that checks raid requirements before initiating a raid on a space rock.
 */
contract OnRaid_Requirements is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It checks the requirements for initiating a raid on a space rock.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the identifier of the space rock.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Decode the space rock identifier and the player's entity from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    bytes32 rockEntity = abi.decode(args, (bytes32));
    bytes32 playerEntity = addressToEntity(msgSender);

    // Check the requirements for initiating a raid on the space rock
    LibRaid.checkRaidRequirements(playerEntity, rockEntity);
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
