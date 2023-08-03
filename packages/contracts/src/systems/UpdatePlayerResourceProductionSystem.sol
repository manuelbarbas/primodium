pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";
import { ID as UpdateActiveStatusSystemID } from "./UpdateActiveStatusSystem.sol";
import { ID as UpdateUnclaimedResourcesSystemID } from "./UpdateUnclaimedResourcesSystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "../components/MaxResourceStorageComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "../components/ActiveComponent.sol";
import { MinesComponent, ID as MinesComponentID } from "../components/MinesComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID } from "../components/BuildingProductionComponent.sol";
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
    uint256 resourceID = BuildingProductionComponent(getAddressById(world.components(), BuildingProductionComponentID))
      .getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel))
      .resource;
    IOnEntitySubsystem(getAddressById(world.systems(), UpdateUnclaimedResourcesSystemID)).executeTyped(
      msg.sender,
      resourceID
    );

    BuildingProductionComponent buildingProductionComponent = BuildingProductionComponent(
      world.getComponent(BuildingProductionComponentID)
    );
    PlayerProductionComponent playerProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
    );

    ResourceValue memory resourceProduction = buildingProductionComponent.getValue(
      LibEncode.hashKeyEntity(buildingType, buildingLevel)
    );
    uint32 currResourceProduction = playerProductionComponent.getValue(
      LibEncode.hashKeyEntity(resourceProduction.resource, playerEntity)
    );
    if (actionType == EActionType.Destroy) {
      currResourceProduction -= resourceProduction.value;
    } else if (actionType == EActionType.Upgrade) {
      currResourceProduction +=
        resourceProduction.value -
        buildingProductionComponent.getValue(LibEncode.hashKeyEntity(buildingType, buildingLevel - 1)).value;
    } else {
      currResourceProduction += resourceProduction.value;
    }
    updateResourceProduction(
      world,
      LibEncode.hashKeyEntity(resourceProduction.resource, playerEntity),
      currResourceProduction
    );
  }

  function updateResourceProduction(IWorld world, uint256 entity, uint32 newResourceProductionRate) internal {
    PlayerProductionComponent playerProductionComponent = PlayerProductionComponent(
      world.getComponent(PlayerProductionComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      world.getComponent(LastClaimedAtComponentID)
    );
    if (newResourceProductionRate == 0) {
      lastClaimedAtComponent.remove(entity);
      playerProductionComponent.remove(entity);
      return;
    }
    if (!lastClaimedAtComponent.has(entity)) lastClaimedAtComponent.set(entity, block.number);
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
