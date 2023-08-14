// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeBuildingSystemID } from "./UpgradeBuildingSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID, ResourceValues } from "../components/P_ProductionDependenciesComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.S_UpdateRequiredProduction"));

contract S_UpdateRequiredProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeBuildingSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "S_UpdatePlayerStorageSystem: Only BuildSystem, UpgradeBuildingSystem, DestroySystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity, EActionType actionType) = abi.decode(
      args,
      (address, uint256, EActionType)
    );
    uint256 buildingType = BuildingTypeComponent(getAddressById(world.components(), BuildingTypeComponentID)).getValue(
      buildingEntity
    );
    uint32 buildingLevel = LevelComponent(getAddressById(world.components(), LevelComponentID)).getValue(
      buildingEntity
    );
    P_ProductionDependenciesComponent requiredConnectedProductionComponent = P_ProductionDependenciesComponent(
      getAddressById(world.components(), P_ProductionDependenciesComponentID)
    );

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingType, buildingLevel);

    if (actionType == EActionType.Build) {
      requiredConnectedProductionComponent.set(
        buildingEntity,
        requiredConnectedProductionComponent.getValue(buildingIdNewLevel)
      );
    } else if (actionType == EActionType.Upgrade) {
      ResourceValues memory currentMines = requiredConnectedProductionComponent.getValue(buildingEntity);
      ResourceValues memory requiredConnectedProductions = requiredConnectedProductionComponent.getValue(
        buildingIdNewLevel
      );
      ResourceValues memory requiredMinesLastLevel = requiredConnectedProductionComponent.getValue(
        LibEncode.hashKeyEntity(buildingType, buildingLevel - 1)
      );
      for (uint256 i = 0; i < requiredConnectedProductions.resources.length; i++) {
        currentMines.values[i] += requiredConnectedProductions.values[i] - requiredMinesLastLevel.values[i];
      }
      requiredConnectedProductionComponent.set(buildingEntity, currentMines);
    } else {
      requiredConnectedProductionComponent.remove(buildingEntity);
    }
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
