// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { IsActive, Level } from "src/codegen/index.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnToggleBuilding_Utility
 * @dev This contract is a system hook that updates utility usage when a building is toggled.
 */
contract OnToggleBuilding_Utility is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
   * It does not perform any actions in this case.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    PositionData memory coord = abi.decode(args, (PositionData));

    // Get the building entity from the coordinates
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);

    if (IsActive.get(buildingEntity)) {
      // Clear utility usage for the building
      LibResource.activateUtilityUsage(buildingEntity);
    } else {
      // Clear utility usage for the building
      LibResource.deactivateUtilityUsage(buildingEntity);
    }
  }
}
