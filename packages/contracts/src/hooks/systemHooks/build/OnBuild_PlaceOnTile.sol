// SPDX-License-Identifier: MIT
pragma solidity >=0.8.21;

import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

/**
 * @title OnBuild_PlaceOnTile
 * @dev This contract is a system hook that handles the placement of a building on a game tile when it is constructed in the game world.
 */
contract OnBuild_PlaceOnTile is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address ,
    ResourceId ,
    bytes memory 
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
   * It places a building on a game tile.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address,
    ResourceId ,
    bytes memory callData
  ) public {
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    (uint8 buildingType, PositionData memory coord) = abi.decode(args, (uint8, PositionData));

    // Get the building prototype associated with the building type
    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, buildingType);

    // Generate the unique building entity key
    bytes32 buildingEntity = LibEncode.getTimedHash(BuildingKey, coord);

    // Place the building on the game tile
    LibBuilding.placeBuildingTiles(buildingEntity, buildingPrototype, coord);
  }
}
