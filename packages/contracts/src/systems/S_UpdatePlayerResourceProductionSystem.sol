// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as SpawnSystemID } from "./SpawnSystem.sol";
import { ID as UpgradeBuildingSystemID } from "./UpgradeBuildingSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./S_UpdateActiveStatusSystem.sol";
import { ID as UpdateUnclaimedResourcesSystemID } from "./S_UpdateUnclaimedResourcesSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { ProductionComponent, ID as ProductionComponentID } from "../components/ProductionComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { P_ProductionComponent, ID as P_ProductionComponentID, ResourceValue } from "../components/P_ProductionComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";

uint256 constant ID = uint256(keccak256("system.S_UpdatePlayerResourceProduction"));

contract S_UpdatePlayerResourceProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), SpawnSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeBuildingSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID) ||
        msg.sender == getAddressById(world.systems(), BuildPathSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroyPathSystemID) ||
        msg.sender == getAddressById(world.systems(), UpdateActiveStatusSystemID),
      "S_UpdatePlayerResourceProductionSystem: Only BuildSystem, SpawnSystem, UpgradeBuildingSystem, DestroySystem, BuildPathSystem and DestroyPathSystem, S_UpdateActiveStatusSystem can call this function"
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
    uint256 playerEntity = addressToEntity(playerAddress);
    P_ProductionComponent buildingProductionComponent = P_ProductionComponent(
      world.getComponent(P_ProductionComponentID)
    );
    ResourceValue memory resourceProduction = buildingProductionComponent.getValue(
      LibEncode.hashKeyEntity(buildingType, buildingLevel)
    );

    IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
      playerAddress,
      resourceProduction.resource
    );

    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));

    uint32 currResourceProduction = LibMath.getSafe(
      productionComponent,
      LibEncode.hashKeyEntity(resourceProduction.resource, playerEntity)
    );
    if (actionType == EActionType.Destroy) {
      currResourceProduction -= productionComponent.getValue(buildingEntity);
      productionComponent.remove(buildingEntity);
    } else if (actionType == EActionType.Upgrade) {
      productionComponent.set(buildingEntity, resourceProduction.value);
      currResourceProduction +=
        resourceProduction.value -
        buildingProductionComponent.getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1)).value;
    } else {
      productionComponent.set(buildingEntity, resourceProduction.value);
      currResourceProduction += resourceProduction.value;
    }

    updateResourceProduction(
      world,
      LibEncode.hashKeyEntity(resourceProduction.resource, playerEntity),
      currResourceProduction
    );
    IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
      playerAddress,
      resourceProduction.resource
    );
  }

  function updateResourceProduction(IWorld world, uint256 entity, uint32 newResourceProductionRate) internal {
    ProductionComponent productionComponent = ProductionComponent(world.getComponent(ProductionComponentID));
    if (newResourceProductionRate == 0) {
      productionComponent.remove(entity);
      return;
    }
    productionComponent.set(entity, newResourceProductionRate);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
