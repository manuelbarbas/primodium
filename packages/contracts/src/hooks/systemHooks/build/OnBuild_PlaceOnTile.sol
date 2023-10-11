pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import {  PositionData } from "codegen/tables/Position.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

contract OnBuild_PlaceOnTile is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {}

  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    (uint8 buildingType, PositionData memory coord) = abi.decode(args, (uint8, PositionData));
    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, buildingType);
    bytes32 playerEntity = addressToEntity(msgSender);
    bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);
    LibBuilding.placeBuildingTiles(playerEntity, buildingPrototype, coord);
  }
}
