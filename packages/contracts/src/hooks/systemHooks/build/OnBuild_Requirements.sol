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

contract OnBuild_Requirements is SystemHook {
  constructor() {}

  function onBeforeCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
    bytes memory args = SliceInstance.toBytes(SliceLib.getSubslice(callData, 4));
    (uint8 buildingTypeRaw, PositionData memory coord) = abi.decode(args, (uint8, PositionData));
    bytes32 buildingEntity = LibEncode.getHash(BuildingKey, coord);
    bytes32 playerEntity = addressToEntity(msgSender);
    EBuilding buildingType = EBuilding(buildingTypeRaw);
    bytes32 buildingPrototype = P_EnumToPrototype.get(BuildingKey, buildingTypeRaw);

    require(Spawned.get(playerEntity), "[BuildSystem] Player has not spawned");
    require(buildingType > EBuilding.NULL && buildingType < EBuilding.LENGTH, "[BuildSystem] Invalid building type");
    require(buildingType != EBuilding.MainBase, "[BuildSystem] Cannot build more than one main base per wallet");
    require(
      coord.parent == Home.getAsteroid(playerEntity),
      "[BuildSystem] Building must be built on your home asteroid"
    );
    
    require(!Spawned.get(buildingEntity), "[BuildSystem] Building already exists");
    require(
      LibBuilding.hasRequiredBaseLevel(playerEntity, buildingPrototype, 1),
      "[BuildSystem] MainBase level requirement not met"
    );
    require(LibBuilding.canBuildOnTile(buildingPrototype, coord), "[BuildSystem] Cannot build on this tile");
  }

  function onAfterCallSystem(
    address msgSender,
    ResourceId systemId,
    bytes memory callData
  ) public {
  }
}
