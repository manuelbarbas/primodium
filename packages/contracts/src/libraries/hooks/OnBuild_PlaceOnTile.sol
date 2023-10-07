pragma solidity >=0.8.21;

import { IStoreHook } from "@latticexyz/store/src/IStoreHook.sol";
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
import { IWorld } from "codegen/world/IWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";
import "forge-std/console.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";

contract OnBuild_PlaceOnTile is IStoreHook {
  constructor() {}

  function onBeforeSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public {}

  function onAfterSpliceStaticData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint48 start,
    bytes memory data
  ) public {}

  function supportsInterface(bytes4 interfaceID) public view returns (bool) {
    return true;
  }

  function onBeforeSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public {
    console.log("called before set record");
    BuildOrderData memory buildOrderData = BuildOrder.decode(staticData, encodedLengths, dynamicData);
    console.log("called before set record decode");
    require(
      LibBuilding.canBuildOnTile(
        buildOrderData.buildingType,
        PositionData(buildOrderData.x, buildOrderData.y, buildOrderData.parrent)
      ),
      "[BuildSystem] Cannot build on this tile"
    );
    console.log("called before set record 2");
  }

  function onAfterSetRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    bytes memory staticData,
    PackedCounter encodedLengths,
    bytes memory dynamicData,
    FieldLayout fieldLayout
  ) public {
    console.log("called after set record");
    BuildOrderData memory buildOrderData = BuildOrder.decode(staticData, encodedLengths, dynamicData);

    console.log("called after set record decode");
    LibBuilding.placeBuildingTiles(
      buildOrderData.playerEntity,
      buildOrderData.buildingEntity,
      buildOrderData.buildingType,
      PositionData(buildOrderData.x, buildOrderData.y, buildOrderData.parrent)
    );
    console.log("called after set record 2");
  }

  function onBeforeSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes memory data
  ) public {
    return;
  }

  function onAfterSpliceDynamicData(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    uint8 dynamicFieldIndex,
    uint40 startWithinField,
    uint40 deleteCount,
    PackedCounter encodedLengths,
    bytes memory data
  ) public {}

  function onBeforeDeleteRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) public {}

  function onAfterDeleteRecord(
    ResourceId tableId,
    bytes32[] memory keyTuple,
    FieldLayout fieldLayout
  ) public {}
}
