// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { UnitKey } from "src/Keys.sol";
import { LibResource } from "libraries/LibResource.sol";
import { Level } from "codegen/tables/Level.sol";
import { UnitLevel } from "codegen/tables/UnitLevel.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

/**
 * @title OnUpgradeUnit_SpendResources
 * @dev This contract is a system hook that handles resource spending when a unit is upgraded in the game world.
 */
contract OnUpgradeUnit_SpendResources is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
   * It spends the required resources when a building is constructed.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public {
    bytes32 playerEntity = _player(msgSender);
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));

    (bytes32 spaceRockEntity, uint8 unit) = abi.decode(args, (bytes32, uint8));
    bytes32 unitPrototype = P_EnumToPrototype.get(UnitKey, unit);

    // Get the unit level
    uint256 level = UnitLevel.get(playerEntity, unitPrototype);

    // Spend the required resources for upgrading the unit
    LibResource.spendUpgradeResources(spaceRockEntity, unitPrototype, level);
  }
}
