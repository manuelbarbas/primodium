pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import {  PositionData } from "codegen/tables/Position.sol";
import {SystemHook} from "@latticexyz/world/src/SystemHook.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibReduceProductionRate } from "libraries/LibReduceProductionRate.sol";
import { LibProduction } from "libraries/LibProduction.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

contract OnBuild_ProductionRate is SystemHook {
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
    bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);
    bytes32 playerEntity = addressToEntity(msgSender);
    LibReduceProductionRate.reduceProductionRate(playerEntity, buildingEntity, 1);
    LibProduction.upgradeResourceProduction(playerEntity, buildingEntity, 1);
  }
}
