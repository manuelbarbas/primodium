// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { RecallSystem } from "systems/RecallSystem.sol";
import { LibResource } from "libraries/LibResource.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { OwnedBy } from "codegen/tables/OwnedBy.sol";

/**
 * @title OnRecall_TargetClaimResources
 * @dev This contract is a system hook that claims resources for target player.
 */
contract OnRecall_TargetClaimResources is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It updates information about the space rock after an invasion if it is owned.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the identifier of the space rock.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    bytes memory functionSelector = SliceInstance.toBytes(SliceLib.getSubslice(callData, 0, 4));
    if (bytes4(functionSelector) == RecallSystem.recallStationedUnits.selector) {
      bytes32 playerEntity = addressToEntity(msgSender);
      bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
      bytes32 rockEntity = abi.decode(args, (bytes32));

      LibResource.claimAllResources(rockEntity);
    }

    // Get the player's entity and decode the space rock identifier from the callData
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
