// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";

import { LibResource } from "libraries/LibResource.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnDestroy_ClearUtility
 * @dev This contract is a system hook that clears utility usage when a building is destroyed in the game world.
 */
contract OnDestroy_ClearUtility is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It clears utility usage when a building is destroyed.
   * @param callData The data passed to the system.
   */
  function onBeforeCallSystem(
    address,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    PositionData memory coord = abi.decode(args, (PositionData));

    // Get the building entity from the coordinates
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    // Clear utility usage for the building
    LibResource.clearUtilityUsage(buildingEntity);
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}
}
