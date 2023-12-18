// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibResource } from "libraries/LibResource.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnAlliance_TargetClaimResources
 * @dev This contract is a system hook that claims resources for the target player who is being kicked.
 */
contract OnAlliance_TargetClaimResources is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. it claims resources for the target player.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the identifier of the space rock.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // get the function selector
    bytes memory functionSelector = SliceInstance.toBytes(SliceLib.getSubslice(callData, 0, 4));
    if (keccak256(functionSelector) == keccak256("kick(bytes32)")) {
      bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
      bytes32 target = abi.decode(args, (bytes32));
      LibResource.claimAllPlayerResources(target);
      return;
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
