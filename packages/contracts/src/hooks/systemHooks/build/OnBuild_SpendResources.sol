// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";

import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibResource } from "libraries/LibResource.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnBuild_SpendResources
 * @dev This contract is a system hook that handles resource spending when a building is constructed in the game world.
 */
contract OnBuild_SpendResources is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
   * It spends the required resources when a building is constructed.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));

    (, PositionData memory coord) = abi.decode(args, (uint8, PositionData));

    // Generate the unique building entity key
    bytes32 buildingEntity = LibEncode.getTimedHash(BuildingKey, coord);

    // Spend the required resources for the building
    LibResource.spendBuildingRequiredResources(buildingEntity, 1);
  }
}
