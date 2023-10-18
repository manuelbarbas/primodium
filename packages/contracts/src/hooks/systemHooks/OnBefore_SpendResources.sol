// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { WorldResourceIdInstance } from "@latticexyz/world/src/WorldResourceId.sol";
import { addressToEntity, getSystemResourceId } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";

import { EBuilding } from "src/Types.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey, UnitKey } from "src/Keys.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { Level } from "codegen/tables/Level.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

import { console } from "forge-std/console.sol";

/**
 * @title OnBefore_SpendResources
 * @dev This contract is a system hook that handles resource spending when a building is constructed in the game world.
 */
contract OnBefore_SpendResources is SystemHook {
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
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    if (ResourceIdInstance.getType(systemId) == ResourceIdInstance.getType(getSystemResourceId("TrainUnitsSystem"))) {
      (bytes32 buildingEntity, uint8 unit, uint256 count) = abi.decode(args, (bytes32, uint8, uint256));

      // Spend the required resources for training units
      LibResource.spendUnitRequiredResources(addressToEntity(msgSender), P_EnumToPrototype.get(UnitKey, unit), count);
    } else {
      revert("[OnBefore_SpendResources]: Invalid systemId");
    }
  }

  /**
   * @dev This function is called after the system's main logic is executed.
   * It spends the required resources when a building is constructed.
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
    if (ResourceIdInstance.getType(systemId) == ResourceIdInstance.getType(getSystemResourceId("BuildSystem"))) {
      (uint8 buildingType, PositionData memory coord) = abi.decode(args, (uint8, PositionData));

      // Generate the unique building entity key
      bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);

      // Spend the required resources for the building
      LibResource.spendBuildingRequiredResources(buildingEntity, 1);
    } else if (
      ResourceIdInstance.getType(systemId) == ResourceIdInstance.getType(getSystemResourceId("UpgradeBuildingSystem"))
    ) {
      console.log("On After UpgradeBuildingSystem");
      PositionData memory coord = abi.decode(args, (PositionData));

      // Get the building entity
      bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);
      console.log("On After UpgradeBuildingSystem 1");
      // Get the building level
      uint256 level = Level.get(buildingEntity);
      console.log("On After UpgradeBuildingSystem 2");
      // Spend the required resources for upgrading the building
      LibResource.spendBuildingRequiredResources(buildingEntity, level);
      console.log("On After After UpgradeBuildingSystem");
    } else {
      revert("[OnBefore_SpendResources]: Invalid systemId");
    }
  }
}
