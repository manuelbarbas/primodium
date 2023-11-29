// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { ExpansionKey } from "src/Keys.sol";
import { LibResource } from "libraries/LibResource.sol";
import { Level } from "codegen/tables/Level.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnUpgradeRange_SpendResources
 * @dev This contract is a system hook that handles resource spending when a base range is expanded
 */
contract OnUpgradeRange_SpendResources is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
   * It spends the required resources when a building is constructed.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    bytes32 spaceRockEntity = abi.decode(args, (bytes32));

    // Get the player level
    uint256 level = Level.get(spaceRockEntity);

    // Spend the required resources for upgrading the unit
    LibResource.spendUpgradeResources(spaceRockEntity, ExpansionKey, level);
  }
}
