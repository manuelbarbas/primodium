// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { P_ProductionDependenciesComponent, ID as P_ProductionDependenciesComponentID, ResourceValues } from "../components/P_ProductionDependenciesComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID } from "../components/P_ProductionComponent.sol";
import { PathComponent, ID as PathComponentID } from "../components/PathComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";

uint256 constant ID = uint256(keccak256("system.S_UpdateConnectedRequiredProduction"));

contract S_UpdateConnectedRequiredProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), DestroySystemID) ||
        msg.sender == getAddressById(world.systems(), BuildPathSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroyPathSystemID),
      "S_UpdateConnectedRequiredProductionSystem: Only DestroyPathSystem, BuildPathSystem, DestroySystem can call this function"
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

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingType, buildingLevel);

    uint256 toEntity = PathComponent(getAddressById(world.components(), PathComponentID)).getValue(buildingEntity);

    P_ProductionDependenciesComponent requiredConnectedProductionComponent = P_ProductionDependenciesComponent(
      getC(P_ProductionDependenciesComponentID)
    );

    P_ProductionComponent buildingProductionComponent = P_ProductionComponent(getC(P_ProductionComponentID));
    ResourceValues memory requiredProduction = requiredConnectedProductionComponent.getValue(toEntity);
    uint256 productionResourceID = buildingProductionComponent.getValue(buildingIdNewLevel).resource;
    for (uint256 i = 0; i < requiredProduction.resources.length; i++) {
      if (requiredProduction.resources[i] != productionResourceID) continue;
      if (actionType == EActionType.Build) {
        requiredProduction.values[i]--;
      } else if (actionType == EActionType.Destroy) {
        requiredProduction.values[i]++;
      }
      break;
    }
    requiredConnectedProductionComponent.set(toEntity, requiredProduction);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
