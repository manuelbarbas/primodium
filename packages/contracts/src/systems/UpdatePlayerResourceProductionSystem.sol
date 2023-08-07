pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";
import "forge-std/console.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./UpdateActiveStatusSystem.sol";
import { ID as UpdateUnclaimedResourcesSystemID } from "./UpdateUnclaimedResourcesSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { BuildingEntityProductionComponent, ID as BuildingEntityProductionComponentID } from "../components/BuildingEntityProductionComponent.sol";
import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "../components/PlayerProductionComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "../components/MaxResourceStorageComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "../components/ActiveComponent.sol";
import { RequiredConnectedProductionComponent, ID as RequiredConnectedProductionComponentID } from "../components/RequiredConnectedProductionComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID, ResourceValue } from "../components/BuildingProductionComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
uint256 constant ID = uint256(keccak256("system.UpdatePlayerResourceProduction"));

contract UpdatePlayerResourceProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID) ||
        msg.sender == getAddressById(world.systems(), BuildPathSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroyPathSystemID) ||
        msg.sender == getAddressById(world.systems(), UpdateActiveStatusSystemID),
      "UpdatePlayerResourceProductionSystem: Only BuildSystem, UpgradeSystem, DestroySystem, BuildPathSystem and DestroyPathSystem, UpdateActiveStatusSystem can call this function"
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
    BuildingProductionComponent buildingProductionComponent = BuildingProductionComponent(
      world.getComponent(BuildingProductionComponentID)
    );
    ResourceValue memory resourceProduction = buildingProductionComponent.getValue(
      LibEncode.hashKeyEntity(buildingType, buildingLevel)
    );

    IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
      playerAddress,
      resourceProduction.resource
    );

    PlayerProductionComponent playerProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
    );

    uint32 currResourceProduction = LibMath.getSafe(
      playerProductionComponent,
      LibEncode.hashKeyEntity(resourceProduction.resource, playerEntity)
    );
    BuildingEntityProductionComponent buildingEntityProductionComponent = BuildingEntityProductionComponent(
      world.getComponent(BuildingEntityProductionComponentID)
    );
    if (actionType == EActionType.Destroy) {
      currResourceProduction -= buildingEntityProductionComponent.getValue(buildingEntity);
      buildingEntityProductionComponent.remove(buildingEntity);
    } else if (actionType == EActionType.Upgrade) {
      buildingEntityProductionComponent.set(buildingEntity, resourceProduction.value);
      currResourceProduction +=
        resourceProduction.value -
        buildingProductionComponent.getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1)).value;
    } else {
      buildingEntityProductionComponent.set(buildingEntity, resourceProduction.value);
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
    PlayerProductionComponent playerProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
    );
    if (newResourceProductionRate == 0) {
      playerProductionComponent.remove(entity);
      return;
    }
    console.log("resource production now at %s", newResourceProductionRate);
    playerProductionComponent.set(entity, newResourceProductionRate);
  }

  function executeTyped(
    address playerAddress,
    uint256 buildingEntity,
    EActionType actionType
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity, actionType));
  }
}
