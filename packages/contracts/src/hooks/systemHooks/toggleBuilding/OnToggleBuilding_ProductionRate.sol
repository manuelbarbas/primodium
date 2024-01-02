// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { IsActive, Level } from "src/codegen/index.sol";

import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnToggleBuilding_ProductionRate
 * @dev This contract is a system hook that handles production rate update when a building is toggled.
 */
contract OnToggleBuilding_ProductionRate is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
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
    if (IsActive.get(buildingEntity)) {
      // Activate consumption
      LibReduceProductionRate.activateReduceProductionRate(buildingEntity, level);

      // Activate Production
      LibProduction.activateResourceProduction(buildingEntity, level);
    } else {
      // Clear production rate reductions for the building
      LibReduceProductionRate.clearProductionRateReduction(buildingEntity);

      // Clear resource production for the building
      LibProduction.clearResourceProduction(buildingEntity);
    }
  }
}
