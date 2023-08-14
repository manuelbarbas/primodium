// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID, ResourceValues } from "components/P_RequiredUtilityComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";
import { P_UnitProductionTypesComponent, ID as P_UnitProductionTypesComponentID } from "components/P_UnitProductionTypesComponent.sol";
import { UnitProductionOwnedByComponent, ID as UnitProductionOwnedByComponentID } from "components/UnitProductionOwnedByComponent.sol";
// types

import { MainBaseID } from "../prototypes.sol";

import { ID as UpdateRequiredProductionSystemID } from "./S_UpdateRequiredProductionSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./S_UpdateActiveStatusSystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "./S_UpdatePlayerStorageSystem.sol";
import { ID as UpdateConnectedRequiredProductionSystemID } from "./S_UpdateConnectedRequiredProductionSystem.sol";
import { ID as UpdateOccupiedUtilitySystemID } from "./S_UpdateOccupiedUtilitySystem.sol";
import { ID as UpdateUtilityProductionSystemID } from "./S_UpdateUtilityProductionSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";

import { Coord } from "../types.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUtilityResource } from "../libraries/LibUtilityResource.sol";

uint256 constant ID = uint256(keccak256("system.Destroy"));

contract DestroySystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function checkUtilityResourceReqsMetAfterDestroy(uint256 buildingEntity) internal view returns (bool) {
    P_UtilityProductionComponent UtilityProductionComponent = P_UtilityProductionComponent(
      getAddressById(components, P_UtilityProductionComponentID)
    );
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );

    LevelComponent levelComponent = LevelComponent(getAddressById(components, LevelComponentID));
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(buildingEntity),
      levelComponent.getValue(buildingEntity)
    );
    if (UtilityProductionComponent.has(buildingLevelEntity)) {
      return
        LibUtilityResource.getAvailableUtilityCapacity(
          world,
          addressToEntity(msg.sender),
          UtilityProductionComponent.getValue(buildingLevelEntity).resource
        ) >= UtilityProductionComponent.getValue(buildingLevelEntity).value;
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
      checkUtilityResourceReqsMetAfterDestroy(buildingEntity),
      "[DestroySystem] can not destory Utility resource production building if requirements are not met, destroy Utility resource consumers first or increase Utility resource production"
    );

    require(ownedByComponent.getValue(buildingEntity) == playerEntity, "[Destroy] : only owner can destroy building");

    uint256[] memory children = childrenComponent.getValue(buildingEntity);
    childrenComponent.remove(buildingEntity);
    for (uint i = 0; i < children.length; i++) {
      clearBuildingTile(ownedByComponent, children[i]);
    }
    childrenComponent.remove(buildingEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, levelComponent.getValue(buildingEntity));
    // for node tiles, check for paths that start or end at the current location and destroy associated paths
    if (pathComponent.has(buildingEntity)) {
      uint256 toEntity = pathComponent.getValue(buildingEntity);
      if (P_ProductionDependenciesComponent(getC(P_ProductionDependenciesComponentID)).has(toEntity)) {
        IOnBuildingSubsystem(getAddressById(world.systems(), UpdateConnectedRequiredProductionSystemID)).executeTyped(
          msg.sender,
          buildingEntity,
          EActionType.Destroy
        );
      }
      //Resource Production Update
      if (P_ProductionComponent(getAddressById(components, P_ProductionComponentID)).has(buildingLevelEntity)) {
        IOnBuildingSubsystem(getAddressById(world.systems(), UpdateActiveStatusSystemID)).executeTyped(
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

    //required production update
    if (
      P_ProductionDependenciesComponent(getAddressById(components, P_ProductionDependenciesComponentID)).has(
        buildingLevelEntity
      )
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateRequiredProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }

    //Utility Production Update
    if (P_UtilityProductionComponent(getC(P_UtilityProductionComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateUtilityProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }
    //Occupied Utility Update
    if (P_RequiredUtilityComponent(getC(P_RequiredUtilityComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateOccupiedUtilitySystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }
    //Resource Storage Update
    if (
      P_MaxResourceStorageComponent(getC(P_MaxResourceStorageComponentID)).has(LibEncode.hashKeyEntity(buildingType, 1))
    ) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePlayerStorageSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Destroy
      );
    }
    if (P_UnitProductionTypesComponent(getC(P_UnitProductionTypesComponentID)).has(buildingLevelEntity)) {
      UnitProductionOwnedByComponent(getC(UnitProductionOwnedByComponentID)).remove(buildingEntity);
    }

    levelComponent.remove(buildingEntity);
    buildingTypeComponent.remove(buildingEntity);
    ownedByComponent.remove(buildingEntity);
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
