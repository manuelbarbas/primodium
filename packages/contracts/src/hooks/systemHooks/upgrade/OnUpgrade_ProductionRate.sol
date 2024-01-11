// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { IsActive, Level } from "src/codegen/index.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnUpgrade_ProductionRate
 * @dev This contract is a system hook that handles the production rate of a building when it is upgraded in the game world.
 */
contract OnUpgrade_ProductionRate is SystemHook {
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

    PositionData memory coord = abi.decode(args, (PositionData));

    // Get the building entity from the coordinates
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);

    // Get the level of the building
    uint256 level = Level.get(buildingEntity);

    if (!IsActive.get(buildingEntity)) return;

    // Adjust the production rate and resource production
    LibReduceProductionRate.reduceProductionRate(buildingEntity, level);
    LibProduction.upgradeResourceProduction(buildingEntity, level);
  }
}
