// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredPassiveComponent, ID as RequiredPassiveComponentID, ResourceValues } from "components/RequiredPassiveComponent.sol";
import { PassiveProductionComponent, ID as PassiveProductionComponentID } from "components/PassiveProductionComponent.sol";
import { MinesComponent, ID as MinesComponentID } from "components/MinesComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID } from "components/BuildingProductionComponent.sol";
// types

import { MainBaseID } from "../prototypes.sol";

import { ID as UpdateRequiredProductionSystemID } from "./UpdateRequiredProductionSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./UpdateActiveStatusSystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "./UpdatePlayerStorageSystem.sol";
import { ID as UpdateConnectedRequiredProductionSystemID } from "./UpdateConnectedRequiredProductionSystem.sol";
import { ID as UpdateOccupiedPassiveSystemID } from "./UpdateOccupiedPassiveSystem.sol";
import { ID as UpdatePassiveProductionSystemID } from "./UpdatePassiveProductionSystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";

import { Coord } from "../types.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibPassiveResource } from "../libraries/LibPassiveResource.sol";

uint256 constant ID = uint256(keccak256("system.Destroy"));

contract DestroySystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function checkPassiveResourceReqsMetAfterDestroy(uint256 buildingEntity) internal view returns (bool) {
    PassiveProductionComponent passiveProductionComponent = PassiveProductionComponent(
      getAddressById(components, PassiveProductionComponentID)
    );
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );

    LevelComponent levelComponent = LevelComponent(getAddressById(components, LevelComponentID));
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(buildingEntity),
      levelComponent.getValue(buildingEntity)
    );
    if (passiveProductionComponent.has(buildingLevelEntity)) {
      return
        LibPassiveResource.getAvailablePassiveCapacity(
          world,
          addressToEntity(msg.sender),
          passiveProductionComponent.getValue(buildingLevelEntity).resource
        ) >= passiveProductionComponent.getValue(buildingLevelEntity).value;
    }
    return true;
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(getC(BuildingTypeComponentID));
    PathComponent pathComponent = PathComponent(getC(PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    ChildrenComponent childrenComponent = ChildrenComponent(getC(ChildrenComponentID));
    LevelComponent levelComponent = LevelComponent(getAddressById(components, LevelComponentID));

    uint256 buildingEntity = getBuildingFromCoord(coord);
    uint256 playerEntity = addressToEntity(msg.sender);
    uint256 buildingType = buildingTypeComponent.getValue(buildingEntity);
    require(
      checkPassiveResourceReqsMetAfterDestroy(buildingEntity),
      "[DestroySystem] can not destory passive resource production building if requirements are not met, destroy passive resource consumers first or increase passive resource production"
    );

    require(ownedByComponent.getValue(buildingEntity) == playerEntity, "[Destroy] : only owner can destroy building");

    uint256[] memory children = childrenComponent.getValue(buildingEntity);
    childrenComponent.remove(buildingEntity);
    for (uint i = 0; i < children.length; i++) {
      clearBuildingTile(ownedByComponent, children[i]);
    }
    childrenComponent.remove(buildingEntity);
    // for node tiles, check for paths that start or end at the current location and destroy associated paths
    if (pathComponent.has(buildingEntity)) {
      uint256 toEntity = pathComponent.getValue(buildingEntity);
      if (MinesComponent(getC(MinesComponentID)).has(toEntity)) {
        IOnBuildingSubsystem(getAddressById(world.systems(), UpdateConnectedRequiredProductionSystemID)).executeTyped(
          msg.sender,
          buildingEntity,
          EActionType.Destroy
        );
      }
      pathComponent.remove(buildingEntity);
    }

    uint256[] memory pathWithEndingTile = pathComponent.getEntitiesWithValue(buildingEntity);
    if (pathWithEndingTile.length > 0) {
      for (uint256 i = 0; i < pathWithEndingTile.length; i++) {
        pathComponent.remove(pathWithEndingTile[i]);
      }
    }

    // for main base tile, remove main base initialized.
    if (buildingType == MainBaseID) {
      MainBaseComponent mainBaseComponent = MainBaseComponent(getC(MainBaseComponentID));
      mainBaseComponent.remove(playerEntity);
    }

    if (!IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID)).has(buildingType)) {
      BuildingCountComponent buildingCountComponent = BuildingCountComponent(getC(BuildingCountComponentID));
      buildingCountComponent.set(playerEntity, LibMath.getSafe(buildingCountComponent, playerEntity) - 1);
    }
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, levelComponent.getValue(buildingEntity));
    //required production update
    if (MinesComponent(getAddressById(components, MinesComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateRequiredProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }

    //Resource Production Update
    if (
      BuildingProductionComponent(getAddressById(components, BuildingProductionComponentID)).has(buildingLevelEntity)
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateActiveStatusSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }

    //Passive Production Update
    if (PassiveProductionComponent(getC(PassiveProductionComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePassiveProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }
    //Occupied Passive Update
    if (RequiredPassiveComponent(getC(RequiredPassiveComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateOccupiedPassiveSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }
    //Resource Storage Update
    if (
      MaxResourceStorageComponent(getC(MaxResourceStorageComponentID)).has(LibEncode.hashKeyEntity(buildingType, 1))
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePlayerStorageSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }

    levelComponent.remove(buildingEntity);
    buildingTypeComponent.remove(buildingEntity);
    ownedByComponent.remove(buildingEntity);
    LastClaimedAtComponent(getC(LastClaimedAtComponentID)).remove(buildingEntity);
    childrenComponent.remove(buildingEntity);
    return abi.encode(buildingEntity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }

  function clearBuildingTile(OwnedByComponent ownedByComponent, uint256 tileEntity) private {
    require(ownedByComponent.has(tileEntity), "[DestroySystem] Cannot destroy unowned coordinate");
    ownedByComponent.remove(tileEntity);
  }
}
