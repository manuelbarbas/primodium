// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";

import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibResource } from "libraries/LibResource.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { ESendType, SendArgs, ERock, Arrival } from "src/Types.sol";
import { OwnedBy } from "codegen/tables/OwnedBy.sol";

/**
 * @title OnTrainUnits_ClaimResources
 * @dev This contract is a system hook that claims resources for target player.
 */
contract OnTrainUnits_ClaimResources is SystemHook {
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
    // Get the player's entity and decode the space rock identifier from the callData
    bytes32 playerEntity = addressToEntity(msgSender);
    LibResource.claimAllResources(playerEntity);
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
