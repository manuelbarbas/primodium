// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { addressToEntity, getSystemResourceId } from "src/utils.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { Level } from "src/codegen/tables/Level.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

/**
 * @title OnAfter_ProductionRate
 * @dev This contract is a system hook that handles the production rate of a building when it is constructed in the game world.
 */
contract OnAfter_ProductionRate is SystemHook {
  constructor() {}

  /**
   * @dev This function is called before the system's main logic is executed.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system.
   */
  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
   * It reduces the production rate of some resources and upgrades resource production of others.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    // Convert the player's address to an entity
    bytes32 playerEntity = addressToEntity(msgSender);
    if (ResourceIdInstance.getType(systemId) == ResourceIdInstance.getType(getSystemResourceId("BuildSystem"))) {
      (uint8 buildingType, PositionData memory coord) = abi.decode(args, (uint8, PositionData));

      // Generate the unique building entity key
      bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);

      // Reduce the production rate of resources the building requires
      LibReduceProductionRate.reduceProductionRate(playerEntity, buildingEntity, 1);

      // Upgrade resource production for the player's building entity
      LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, 1);
    } else if (
      ResourceIdInstance.getType(systemId) == ResourceIdInstance.getType(getSystemResourceId("UpgradeBuildingSystem"))
    ) {
      PositionData memory coord = abi.decode(args, (PositionData));

      // Get the building entity from the coordinates
      bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);

      // Get the level of the building
      uint256 level = Level.get(buildingEntity);

      // Adjust the production rate and resource production
      LibReduceProductionRate.reduceProductionRate(playerEntity, buildingEntity, level);
      LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, level);
    } else {
      revert("[OnAfter_ProductionRate]: Invalid system ID");
    }
  }
}
