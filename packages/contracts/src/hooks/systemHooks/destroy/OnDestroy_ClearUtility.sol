pragma solidity >=0.8.21;

import { addressToEntity } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PositionData } from "codegen/tables/Position.sol";

import { EBuilding } from "src/Types.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { LibResource } from "libraries/LibResource.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";

contract OnDestroy_ClearUtility is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    PositionData memory coord = abi.decode(args, (PositionData));
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    bytes32 playerEntity = addressToEntity(msgSender);
    LibResource.clearUtilityUsage(playerEntity, buildingEntity);
  }

  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {}
}
