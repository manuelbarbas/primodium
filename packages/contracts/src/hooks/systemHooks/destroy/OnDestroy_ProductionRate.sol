// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { _player } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { IsActive } from "codegen/index.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnDestroy_ProductionRate
 * @dev This contract is a system hook that handles production rate reduction and clearing resource production when a building is destroyed in the game world.
 */
contract OnDestroy_ProductionRate is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed. It clears production rate reductions and resource production when a building is destroyed.
   * @param msgSender The address of the message sender.
   * @param callData The data passed to the system.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId,
    bytes memory callData
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    PositionData memory coord = abi.decode(args, (PositionData));

    // Get the building entity from the coordinates
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);

    // Convert the player's address to an entity
    bytes32 playerEntity = _player(msgSender, false);

    if (!IsActive.get(buildingEntity)) return;

    // Clear production rate reductions for the building
    LibReduceProductionRate.clearProductionRateReduction(buildingEntity);

    // Clear resource production for the building
    LibProduction.clearResourceProduction(buildingEntity);
  }

  function onAfterCallSystem(
    address,
    ResourceId,
    bytes memory
  ) public {
    // This function does not perform any actions in this case.
  }
}
