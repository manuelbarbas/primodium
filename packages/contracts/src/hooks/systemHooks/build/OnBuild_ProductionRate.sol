// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnBuild_ProductionRate
 * @dev This contract is a system hook that handles the production rate of a building when it is constructed in the game world.
 */
contract OnBuild_ProductionRate is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
   * It reduces the production rate of some resources and upgrades resource production of others.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));

    (uint8 buildingType, PositionData memory coord) = abi.decode(args, (uint8, PositionData));

    // Generate the unique building entity key
    bytes32 buildingEntity = LibEncode.getTimedHash(BuildingKey, coord);

    // Reduce the production rate of resources the building requires
    LibReduceProductionRate.reduceProductionRate(buildingEntity, 1);

    // Upgrade resource production for the player's building entity
    LibProduction.upgradeResourceProduction(buildingEntity, 1);
  }
}
