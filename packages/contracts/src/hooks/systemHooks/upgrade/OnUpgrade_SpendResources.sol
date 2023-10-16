// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { Position, PositionTableId, PositionData } from "codegen/tables/Position.sol";
import { Level } from "codegen/tables/Level.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibResource } from "libraries/LibResource.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

/**
 * @title OnUpgrade_SpendResources
 * @dev This contract is a system hook that handles spending resources when upgrading a building.
 */
contract OnUpgrade_SpendResources is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It doesn't perform any specific actions before the upgrade system is called.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system, including the parameters of the upgrade function.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // This function doesn't perform any actions before the system is called.
  }

  /**
   * @dev This function is called after the system's main logic is executed. It handles spending required resources after a building is upgraded.
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

    // Get the building entity
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);

    // Get the player's entity
    bytes32 playerEntity = addressToEntity(msgSender);

    // Get the building level
    uint256 level = Level.get(buildingEntity);

    // Spend the required resources for upgrading the building
    LibResource.spendBuildingRequiredResources(buildingEntity, level);
  }
}
