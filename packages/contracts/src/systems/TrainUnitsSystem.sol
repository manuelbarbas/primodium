// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { P_RequiredResourcesComponent, ID as P_RequiredResourcesComponentID } from "components/P_RequiredResourcesComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "components/P_MaxResourceStorageComponent.sol";
import { MainBaseComponent, ID as MainBaseComponentID } from "components/MainBaseComponent.sol";
import { P_IgnoreBuildLimitComponent, ID as P_IgnoreBuildLimitComponentID } from "components/P_IgnoreBuildLimitComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { P_RequiredUtilityComponent, ID as P_RequiredUtilityComponentID, ResourceValues } from "components/P_RequiredUtilityComponent.sol";
import { P_UtilityProductionComponent, ID as P_UtilityProductionComponentID } from "components/P_UtilityProductionComponent.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID } from "components/P_ProductionDependenciesComponent.sol";
import { P_IsBuildingTypeComponent, ID as P_IsBuildingTypeComponentID } from "components/P_IsBuildingTypeComponent.sol";
import { UnitProductionQueueComponent, ID as UnitProductionQueueComponentID, ResourceValue } from "components/UnitProductionQueueComponent.sol";
import { UnitProductionQueueIndexComponent, ID as UnitProductionQueueIndexComponentID } from "components/UnitProductionQueueIndexComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "../components/LastClaimedAtComponent.sol";

import { MainBaseID, BuildingKey } from "../prototypes.sol";
import { HousingUtilityResourceID } from "../prototypes/Resource.sol";
// libraries
import { Coord } from "../types.sol";
import { LibUnits } from "../libraries/LibUnits.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibUtilityResource } from "../libraries/LibUtilityResource.sol";

import { IOnBuildingCountSubsystem } from "../interfaces/IOnBuildingCountSubsystem.sol";
import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnEntityCountSubsystem } from "../interfaces/IOnEntityCountSubsystem.sol";
import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";
import { IOnSubsystem } from "../interfaces/IOnSubsystem.sol";
import { ID as S_CheckRequiredTileSystemID } from "./S_CheckRequiredTileSystem.sol";
import { ID as S_ClaimUnitsSystem } from "./S_ClaimUnitsSystem.sol";
import { ID as PlaceBuildingTilesSystemID } from "./S_PlaceBuildingTilesSystem.sol";
import { ID as SpendRequiredResourcesSystemID } from "./S_SpendRequiredResourcesSystem.sol";
import { ID as UpdatePlayerStorageSystemID } from "./S_UpdatePlayerStorageSystem.sol";
import { ID as UpdateRequiredProductionSystemID } from "./S_UpdateRequiredProductionSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./S_UpdateActiveStatusSystem.sol";
import { ID as UpdateUtilityProductionSystemID } from "./S_UpdateUtilityProductionSystem.sol";
import { ID as UpdateOccupiedUtilitySystemID } from "./S_UpdateOccupiedUtilitySystem.sol";

uint256 constant ID = uint256(keccak256("system.TrainUnits"));

contract TrainUnitsSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 buildingEntity, uint256 unitType, uint32 count) public returns (bytes memory) {
    return execute(abi.encode(buildingEntity, unitType, count));
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 buildingEntity, uint256 unitType, uint32 count) = abi.decode(args, (uint256, uint256, uint32));

    uint256 playerEntity = addressToEntity(msg.sender);

    uint256 unitTypeLevelEntity = LibUnits.getPlayerUnitTypeLevel(world, playerEntity, unitType);
    require(
      LibUnits.canBuildingProduceUnit(world, buildingEntity, unitType),
      "[TrainUnitsSystem] Building cannot produce unit"
    );

    require(
      LibUnits.checkUtilityResourceReqs(world, playerEntity, unitType, count),
      "[TrainUnitsSystem] You do not have the required Utility resources"
    );

    //check resource requirements and if ok spend required resources
    if (P_RequiredResourcesComponent(getC(P_RequiredResourcesComponentID)).has(unitTypeLevelEntity)) {
      require(
        LibUnits.hasRequiredResources(world, playerEntity, unitType, count),
        "[TrainUnitsSystem] You do not have the required resources"
      );
      IOnEntityCountSubsystem(getAddressById(world.systems(), SpendRequiredResourcesSystemID)).executeTyped(
        msg.sender,
        unitTypeLevelEntity,
        count
      );
    }

    //Occupied Utility Update
    if (P_RequiredUtilityComponent(getC(P_RequiredUtilityComponentID)).has(unitTypeLevelEntity)) {
      // update occupied utility
      LibUnits.updateOccuppiedUtilityResources(world, playerEntity, unitType, count, true);
    }
    UnitProductionQueueIndexComponent unitProductionQueueIndexComponent = UnitProductionQueueIndexComponent(
      getC(UnitProductionQueueIndexComponentID)
    );

    if (unitProductionQueueIndexComponent.has(buildingEntity))
      IOnSubsystem(getAddressById(world.systems(), S_ClaimUnitsSystem)).executeTyped(msg.sender);
    else LastClaimedAtComponent(getC(LastClaimedAtComponentID)).set(buildingEntity, block.number);

    uint32 queueIndex = 0;
    if (unitProductionQueueIndexComponent.has(buildingEntity)) {
      queueIndex = unitProductionQueueIndexComponent.getValue(buildingEntity) + 1;
    }

    unitProductionQueueIndexComponent.set(buildingEntity, queueIndex);
    uint256 buildingQueueEntity = LibEncode.hashKeyEntity(buildingEntity, queueIndex);

    UnitProductionQueueComponent(getC(UnitProductionQueueComponentID)).set(
      buildingQueueEntity,
      ResourceValue({ resource: unitType, value: count })
    );

    return abi.encode(buildingEntity);
  }
}
