// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

// types
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { RequiredConnectedProductionComponent, ID as RequiredConnectedProductionComponentID } from "components/RequiredConnectedProductionComponent.sol";

import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { ID as UpdatePlayerResourceProductionSystemID } from "./UpdatePlayerResourceProductionSystem.sol";

import { ResourceValues } from "../types.sol";

// libraries
import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.UpdateActiveStatus"));

contract UpdateActiveStatusSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  // todo: rewrite this function to be simpler and less confusing
  function updateActiveStatus(address playerAddress, uint256 buildingEntity, bool isActive) internal {
    ActiveComponent activeComponent = ActiveComponent(getAddressById(components, ActiveComponentID));
    bool wasActive = activeComponent.has(buildingEntity);
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    LevelComponent levelComponent = LevelComponent(getAddressById(components, LevelComponentID));

    if (wasActive != isActive) {
      if (isActive) {
        activeComponent.set(buildingEntity);
      } else {
        activeComponent.remove(buildingEntity);
      }
      if (pathComponent.has(buildingEntity)) {
        uint256 connectedToBuildingEntity = pathComponent.getValue(buildingEntity);
        if (doesRequireMine(connectedToBuildingEntity)) {
          executeTyped(playerAddress, connectedToBuildingEntity, EActionType.Build);
        } else {
          IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePlayerResourceProductionSystemID)).executeTyped(
            playerAddress,
            buildingEntity,
            isActive ? EActionType.Build : EActionType.Destroy
          );
        }
      }
    } else if (isActive) {
      if (pathComponent.has(buildingEntity)) {
        uint256 connectedToBuildingEntity = pathComponent.getValue(buildingEntity);
        if (doesRequireMine(connectedToBuildingEntity)) {
          executeTyped(playerAddress, connectedToBuildingEntity, EActionType.Build);
        } else {
          IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePlayerResourceProductionSystemID)).executeTyped(
            playerAddress,
            buildingEntity,
            levelComponent.getValue(buildingEntity) > 1 ? EActionType.Upgrade : EActionType.Build
          );
        }
      }
    }
  }

  function doesRequireMine(uint256 buildingEntity) internal view returns (bool) {
    uint256 buildingType = BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID)).getValue(
      buildingEntity
    );
    uint32 buildingLevel = LevelComponent(getAddressById(components, LevelComponentID)).getValue(buildingEntity);
    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);
    return
      RequiredConnectedProductionComponent(getAddressById(components, RequiredConnectedProductionComponentID)).has(
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
      "UpdateActiveStatusSystem: Only BuildSystem, DestroySystem, UpgradeSystem, BuildPathSystem, DestroyPathSystem and UpdateActiveStatusSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity, EActionType actionType) = abi.decode(
      args,
      (address, uint256, EActionType)
    );
    uint256 playerEntity = addressToEntity(playerAddress);
    uint256 buildingType = BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID)).getValue(
      buildingEntity
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

    ActiveComponent activeComponent = ActiveComponent(getAddressById(components, ActiveComponentID));
    LevelComponent levelComponent = LevelComponent(getAddressById(components, LevelComponentID));

    uint256 buildingLevel = levelComponent.getValue(buildingEntity);
    uint256 buildingTypeLevelEntity = LibEncode.hashKeyEntity(buildingType, buildingLevel);

    // first check if any connected resource production buildings are not at the required level or require resource production buildings themeselves and are not active
    if (
      RequiredConnectedProductionComponent(getC(RequiredConnectedProductionComponentID)).has(buildingTypeLevelEntity)
    ) {
      uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(buildingEntity);
      for (uint256 i = 0; i < connectedMineEntities.length; i++) {
        if (
          levelComponent.getValue(connectedMineEntities[i]) < buildingLevel ||
          (doesRequireMine(connectedMineEntities[i]) && !activeComponent.has(connectedMineEntities[i]))
        ) {
          updateActiveStatus(playerAddress, buildingEntity, false);
          return abi.encode(false);
        }
      }
      ResourceValues memory minesData = RequiredConnectedProductionComponent(
        getAddressById(components, RequiredConnectedProductionComponentID)
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
