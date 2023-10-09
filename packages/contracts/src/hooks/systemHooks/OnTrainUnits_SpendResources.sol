pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId } from "src/utils.sol";
import { SystemHook } from "@latticexyz/world/src/SystemHook.sol";
import { Schema, SchemaLib } from "@latticexyz/store/src/Schema.sol";
import { StoreSwitch } from "@latticexyz/store/src/StoreSwitch.sol";
import { IStore } from "@latticexyz/store/src/IStore.sol";
import { StoreCore } from "@latticexyz/store/src/StoreCore.sol";
import { ResourceId } from "@latticexyz/store/src/ResourceId.sol";
import { PackedCounter } from "@latticexyz/store/src/PackedCounter.sol";
import { FieldLayout } from "@latticexyz/store/src/FieldLayout.sol";
import { BuildingType, BuildingTypeTableId } from "codegen/tables/BuildingType.sol";
import { Position, PositionTableId, PositionData } from "codegen/tables/Position.sol";
import { OwnedBy, OwnedByTableId } from "codegen/tables/OwnedBy.sol";
import { Bounds } from "libraries/LibBuilding.sol";
import { OnHookChangedValue, OnHookChangedValueTableId } from "codegen/tables/OnHookChangedValue.sol";
import { ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { BuildOrder, BuildOrderTableId, BuildOrderData } from "codegen/tables/BuildOrder.sol";
import { EBuilding } from "src/Types.sol";
import { BuildSystem } from "systems/BuildSystem.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { UnitKey } from "src/Keys.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";
import "forge-std/console.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";

contract OnTrainUnits_SpendResources is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    console.log("called before call system");
    //(EBuilding buildingType, PositionData memory coord) = abi.decode(callData, (EBuilding, PositionData));

    (bytes32 buildingEntity, uint8 rawUnitType, uint256 count) = abi.decode(callData, (bytes32, uint8, uint256));
    P_EnumToPrototype.get(UnitKey, rawUnitType);
    console.log("called before call system 2");

    console.log("called before call system ");
  }

  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    console.log("called after call system 1");
    // (uint8 buildingType, {int32 x, int32 y, bytes32 parent}) = abi.decode(callData, (uint8, (int32,int32,bytes32)));
    // PositionData memory coord = PositionData(x, y, parent);
    // console.log("called after call system 2");
    // bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, buildingType);
    // bytes32 playerEntity = OwnedBy.get(parent);
    // bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);
    // LibBuilding.placeBuildingTiles(
    //   playerEntity,
    //   buildingPrototype,
    //   coord
    // );
  }
}
