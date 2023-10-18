pragma solidity >=0.8.21;

import { addressToEntity, getSystemResourceId } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId, ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";
import { Level } from "codegen/tables/Level.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibStorage } from "libraries/LibStorage.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnAfter_MaxStorage
 * @dev This contract is a system hook that handles the max storage capacity of a building when it is constructed in the game world.
 */
contract OnAfter_MaxStorage is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {}

  /**
   * @dev This function is called after the system's main logic is executed.
   * It increases the max storage capacity of a player's building entity.
   * @param msgSender The address of the message sender.
   * @param systemId The identifier of the system.
   * @param callData The data passed to the system.
   */
  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    // Convert the player's address to an entity
    bytes32 playerEntity = addressToEntity(msgSender);
    // Decode the arguments from the callData
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    if (ResourceIdInstance.getType(systemId) == ResourceIdInstance.getType(getSystemResourceId("BuildSystem"))) {
      (uint8 buildingType, PositionData memory coord) = abi.decode(args, (uint8, PositionData));
      // Generate the unique building entity key
      bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);
      // Increase the max storage capacity for the player's building entity
      LibStorage.increaseMaxStorage(playerEntity, buildingEntity, 1);
    } else if (
      ResourceIdInstance.getType(systemId) == ResourceIdInstance.getType(getSystemResourceId("UpgradeBuildingSystem"))
    ) {
      PositionData memory coord = abi.decode(args, (PositionData));

      // Get the building entity from the coordinates
      bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);

      // Get the level of the building
      uint256 level = Level.get(buildingEntity);
      // Increase the maximum storage capacity
      LibStorage.increaseMaxStorage(playerEntity, buildingEntity, level);
    } else {
      revert("[OnAfter_MaxStorage]: Invalid system ID");
    }
  }
}
