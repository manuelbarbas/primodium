// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

// types
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";

import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { ID as UpdatePlayerResourceProductionSystemID } from "./S_UpdatePlayerResourceProductionSystem.sol";

import { ResourceValues } from "../types.sol";

// libraries
import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.S_UpdateActiveStatus"));

contract S_UpdateActiveStatusSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function updateActiveStatus(address playerAddress, uint256 buildingEntity, bool isActive) internal {
    ActiveComponent activeComponent = ActiveComponent(getAddressById(components, ActiveComponentID));
    bool wasActive = activeComponent.has(buildingEntity);

    if (wasActive == isActive && !isActive) return;

    if (isActive && !wasActive) {
      activeComponent.set(buildingEntity);
    } else if (!isActive && wasActive) {
      activeComponent.remove(buildingEntity);
    }

    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    if (!pathComponent.has(buildingEntity)) return;
    uint256 connectedToBuildingEntity = pathComponent.getValue(buildingEntity);
    if (mineRequired(connectedToBuildingEntity)) {
      executeTyped(playerAddress, connectedToBuildingEntity, EActionType.Build);
      return;
    }
    LevelComponent levelComponent = LevelComponent(getAddressById(components, LevelComponentID));

    IOnBuildingSubsystem subsystem = IOnBuildingSubsystem(
      getAddressById(world.systems(), UpdatePlayerResourceProductionSystemID)
    );

    EActionType actionType;
    if (isActive != wasActive) actionType = isActive ? EActionType.Build : EActionType.Destroy;
    else actionType = levelComponent.getValue(buildingEntity) > 1 ? EActionType.Upgrade : EActionType.Build;
    subsystem.executeTyped(playerAddress, buildingEntity, actionType);
  }

  function mineRequired(uint256 buildingEntity) private view returns (bool) {
    uint256 buildingType = BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID)).getValue(
      buildingEntity
    );
    uint32 buildingLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(buildingEntity);
    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    return
      P_ProductionDependenciesComponent(getAddressById(components, P_ProductionDependenciesComponentID)).has(
        buildingTypeLevelEntity
      );
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), BuildPathSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroyPathSystemID) ||
        msg.sender == getAddressById(world.systems(), ID),
      "S_UpdateActiveStatusSystem: Only BuildSystem, DestroySystem, UpgradeSystem, BuildPathSystem, DestroyPathSystem and S_UpdateActiveStatusSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity, EActionType actionType) = abi.decode(
      args,
      (address, uint256, EActionType)
    );

    if (actionType == EActionType.Destroy) {
      updateActiveStatus(playerAddress, buildingEntity, false);
      return abi.encode(false);
    }

    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));

    if (!pathComponent.has(buildingEntity)) {
      updateActiveStatus(playerAddress, buildingEntity, false);
      return abi.encode(false);
    }
    LevelComponent levelComponent = LevelComponent(getAddressById(components, LevelComponentID));
    uint256 buildingLevel = levelComponent.getValue(buildingEntity);
    uint256 buildingType = BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID)).getValue(
      buildingEntity
    );
    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);

    // first check if any connected resource production buildings are not at the required level or require resource production buildings themeselves and are not active
    if (P_ProductionDependenciesComponent(getC(P_ProductionDependenciesComponentID)).has(buildingTypeLevelEntity)) {
      ActiveComponent activeComponent = ActiveComponent(getAddressById(components, ActiveComponentID));
      uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(buildingEntity);
      for (uint256 i = 0; i < connectedMineEntities.length; i++) {
        if (
          levelComponent.getValue(connectedMineEntities[i]) < buildingLevel ||
          (mineRequired(connectedMineEntities[i]) && !activeComponent.has(connectedMineEntities[i]))
        ) {
          updateActiveStatus(playerAddress, buildingEntity, false);
          return abi.encode(false);
        }
      }
      ResourceValues memory minesData = P_ProductionDependenciesComponent(
        getAddressById(components, P_ProductionDependenciesComponentID)
      ).getValue(buildingEntity);
      //then check if there are enough connected resource production buildings
      for (uint256 i = 0; i < minesData.values.length; i++) {
        if (minesData.values[i] > 0) {
          updateActiveStatus(playerAddress, buildingEntity, false);
          return abi.encode(false);
        }
      }
    }

    //if all conditions are met make factory functional
    updateActiveStatus(playerAddress, buildingEntity, true);
    return abi.encode(true);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
