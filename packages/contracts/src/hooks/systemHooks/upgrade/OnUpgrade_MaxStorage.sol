// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { Level } from "codegen/tables/Level.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { PositionData } from "codegen/tables/Position.sol";

/**
 * @title OnUpgrade_MaxStorage
 * @dev This contract is a system hook that increases the maximum storage capacity of a building upon upgrade.
 */
contract OnUpgrade_MaxStorage is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It doesn't perform any specific actions in this case.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // This function doesn't perform any actions before the system is called.
  }

  /**
   * @dev This function is called after the system's main logic is executed. It increases the maximum storage capacity of a building upon upgrade.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the parameters of the upgrade function.
   */
  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Decode the parameters from the call data
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    PositionData memory coord = abi.decode(args, (PositionData));

    // Get the building entity from the coordinates
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);

    // Get the player's entity
    bytes32 playerEntity = addressToEntity(msgSender);

    // Get the level of the building
    uint256 level = Level.get(buildingEntity);

    // Increase the maximum storage capacity
    LibStorage.increaseMaxStorage(playerEntity, buildingEntity, level);
  }
}
