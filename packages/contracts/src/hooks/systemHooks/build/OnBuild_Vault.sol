pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData, P_EnumToPrototype } from "codegen/index.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibVault } from "libraries/LibVault.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

/**
 * @title OnBuild_Vault
 * @dev This contract is a system hook that handles the max storage capacity of a building when it is constructed in the game world.
 */
contract OnBuild_Vault is SystemHook {
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

    (uint8 buildingType, PositionData memory coord) = abi.decode(args, (uint8, PositionData));
    // Generate the unique building entity key
    bytes32 buildingEntity = LibEncode.getTimedHash(BuildingKey, coord);

    LibVault.increasePlayerVault(playerEntity, P_EnumToPrototype.get(BuildingKey, buildingType), 1);
  }
}
