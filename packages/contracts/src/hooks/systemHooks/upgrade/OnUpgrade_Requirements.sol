pragma solidity >=0.8.21;

import { addressToEntity, entityToAddress, getSystemResourceId, bytes32ToString } from "src/utils.sol";
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
import { P_MaxLevel } from "codegen/tables/P_MaxLevel.sol";
import { Level } from "codegen/tables/Level.sol";
import { Bounds } from "libraries/LibBuilding.sol";
import { OnHookChangedValue, OnHookChangedValueTableId } from "codegen/tables/OnHookChangedValue.sol";
import { ResourceIdInstance } from "@latticexyz/store/src/ResourceId.sol";
import { Home } from "codegen/tables/Home.sol";
import { EBuilding } from "src/Types.sol";
import { BuildSystem } from "systems/BuildSystem.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { BuildingKey } from "src/Keys.sol";
import { IWorld } from "codegen/world/IWorld.sol";
import { System } from "@latticexyz/world/src/System.sol";
import { LibBuilding } from "libraries/LibBuilding.sol";
import { SliceLib, SliceInstance } from "@latticexyz/store/src/Slice.sol";
import { P_EnumToPrototype } from "codegen/tables/P_EnumToPrototype.sol";
import { Spawned } from "codegen/tables/Spawned.sol";

contract OnUpgrade_Requirements is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    PositionData memory coord = abi.decode(args, (PositionData));

    bytes32 playerEntity = addressToEntity(msgSender);
    bytes32 buildingEntity = LibBuilding.getBuildingFromCoord(coord);
    require(buildingEntity != 0, "[UpgradeBuildingSystem] no building at this coordinate");

    uint256 targetLevel = Level.get(buildingEntity) + 1;
    require(targetLevel > 1, "[UpgradeBuildingSystem] Cannot upgrade a non-building");
    require(
      OwnedBy.get(buildingEntity) == playerEntity,
      "[UpgradeBuildingSystem] Cannot upgrade a building that is not owned by you"
    );

    bytes32 buildingPrototype = BuildingType.get(buildingEntity);
    uint256 maxLevel = P_MaxLevel.get(buildingPrototype);
    require((targetLevel <= maxLevel), "[UpgradeBuildingSystem] Building has reached max level");

    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, buildingPrototype, targetLevel),
      "[UpgradeBuildingSystem] MainBase level requirement not met"
    );
  }

  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {}
}
