// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld } from "systems/internal/PrimodiumSystem.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";

import { ID as SpendRequiredResourcesSystemID } from "./S_SpendRequiredResourcesSystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "./S_UpdatePlayerStorageSystem.sol";
import { ID as UpdateUtilityProductionSystemID } from "./S_UpdateUtilityProductionSystem.sol";
import { ID as UpdateOccupiedUtilitySystemID } from "./S_UpdateOccupiedUtilitySystem.sol";
import { ID as S_UpdatePlayerResourceProductionSystemID } from "systems/S_UpdatePlayerResourceProductionSystem.sol";

import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "components/LevelComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { P_MaxMovesComponent, ID as P_MaxMovesComponentID } from "components/P_MaxMovesComponent.sol";
import { MaxMovesComponent, ID as MaxMovesComponentID } from "components/MaxMovesComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID } from "components/P_RequiredUtilityComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_MaxLevelComponent, ID as P_MaxLevelComponentID } from "components/P_MaxLevelComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID } from "components/P_ProductionComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_UnitProductionTypesComponent, ID as P_UnitProductionTypesComponentID } from "components/P_UnitProductionTypesComponent.sol";

import { Coord } from "src/types.sol";

import { LibBuilding } from "libraries/LibBuilding.sol";
import { LibMath } from "libraries/LibMath.sol";
import { LibResearch } from "libraries/LibResearch.sol";
import { LibEncode } from "libraries/LibEncode.sol";
import { LibResource } from "libraries/LibResource.sol";

import { IOnEntitySubsystem } from "src/interfaces/IOnEntitySubsystem.sol";
import { IOnBuildingSubsystem, EActionType } from "src/interfaces/IOnBuildingSubsystem.sol";

uint256 constant ID = uint256(keccak256("system.UpgradeBuilding"));

contract UpgradeBuildingSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    LevelComponent levelComponent = LevelComponent(getAddressById(components, BuildingComponentID));

    P_MaxLevelComponent maxLevelComponent = P_MaxLevelComponent(getAddressById(components, P_MaxLevelComponentID));

    // Check there isn't another tile there
    uint256 buildingEntity = getBuildingFromCoord(coord);
    require(buildingEntity != 0, "[UpgradeBuildingSystem] no building at this coordinate");
    require(levelComponent.has(buildingEntity), "[UpgradeBuildingSystem] Cannot upgrade a non-building");
    uint256 playerEntity = addressToEntity(msg.sender);
    require(
      ownedByComponent.getValue(buildingEntity) == playerEntity,
      "[UpgradeBuildingSystem] Cannot upgrade a building that is not owned by you"
    );
    uint256 buildingType = buildingTypeComponent.getValue(buildingEntity);
    require(
      maxLevelComponent.has(buildingType) &&
        (levelComponent.getValue(buildingEntity) < maxLevelComponent.getValue(buildingType)),
      "[UpgradeBuildingSystem] Cannot upgrade building that does not have max level or has reached max level"
    );

    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingType, levelComponent.getValue(buildingEntity) + 1);
    require(
      LibResearch.hasResearched(world, buildingIdLevel, playerEntity),
      "[UpgradeBuildingSystem] Cannot upgrade a building that does not meet research requirements"
    );

    require(
      LibBuilding.checkMainBaseLevelRequirement(world, playerEntity, buildingIdLevel),
      "[ResearchSystem] MainBase level requirement not met"
    );

    if (P_ProductionDependenciesComponent(getC(P_ProductionDependenciesComponentID)).has(buildingIdLevel)) {
      require(
        LibResource.checkResourceProductionRequirements(
          world,
          playerEntity,
          buildingType,
          levelComponent.getValue(buildingEntity) + 1
        ),
        "[UpgradeBuildingSystem] You do not have the required production resources"
      );
    }

    //spend required resources
    if (P_RequiredResourcesComponent(getAddressById(components, P_RequiredResourcesComponentID)).has(buildingIdLevel)) {
      require(
        LibResource.hasRequiredResources(world, playerEntity, buildingIdLevel, 1),
        "[UpgradeBuildingSystem] You do not have the required resources"
      );
      IOnEntitySubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        buildingIdLevel
      );
    }

    //apply production based on required production
    if (P_ProductionDependenciesComponent(getC(P_ProductionDependenciesComponentID)).has(buildingIdLevel)) {
      LibResource.updateRequiredProduction(
        world,
        playerEntity,
        buildingType,
        levelComponent.getValue(buildingEntity) + 1,
        true
      );
    }

    //update building level
    uint32 newLevel = levelComponent.getValue(buildingEntity) + 1;
    levelComponent.set(buildingEntity, newLevel);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingType, newLevel);

    /* ------------------------------- Starmapper ------------------------------- */
    if (P_MaxMovesComponent(world.getComponent(P_MaxMovesComponentID)).has(buildingLevelEntity)) {
      uint32 movesToAdd = P_MaxMovesComponent(world.getComponent(P_MaxMovesComponentID)).getValue(buildingLevelEntity);
      uint256 prevBuildingLevelEntity = LibEncode.hashKeyEntity(buildingType, newLevel - 1);
      uint32 movesToSubtract = P_MaxMovesComponent(world.getComponent(P_MaxMovesComponentID)).getValue(
        prevBuildingLevelEntity
      );
      LibMath.add(
        MaxMovesComponent(world.getComponent(MaxMovesComponentID)),
        playerEntity,
        movesToAdd - movesToSubtract
      );
    }

    //Resource Production Update
    if (P_ProductionComponent(getAddressById(components, P_ProductionComponentID)).has(buildingIdLevel)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), S_UpdatePlayerResourceProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Upgrade
      );
    }

    //Storage Update
    if (P_MaxResourceStorageComponent(getC(P_MaxResourceStorageComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdatePlayerStorageSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Upgrade
      );
    }
    //Utility Production Update
    if (P_UtilityProductionComponent(getC(P_UtilityProductionComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateUtilityProductionSystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Upgrade
      );
    }
    //Occupied Utility Update
    if (P_RequiredUtilityComponent(getC(P_RequiredUtilityComponentID)).has(buildingLevelEntity)) {
      IOnBuildingSubsystem(getAddressById(world.systems(), UpdateOccupiedUtilitySystemID)).executeTyped(
        msg.sender,
        buildingEntity,
        EActionType.Upgrade
      );
    }
    return abi.encode(buildingEntity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
