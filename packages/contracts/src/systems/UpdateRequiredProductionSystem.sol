pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";

import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { ItemComponent, ID as ItemComponentID } from "../components/ItemComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "../components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "../components/MaxResourceStorageComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
uint256 constant ID = uint256(keccak256("system.UpdateRequiredProduction"));

contract UpdateRequiredProductionSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "UpdatePlayerStorageSystem: Only BuildSystem, UpgradeSystem, DestroySystem can call this function"
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
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      world.getComponent(MaxResourceStorageComponentID)
    );

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingType, buildingLevel);

    if (!maxResourceStorageComponent.has(buildingIdNewLevel)) return;
    uint256 buildingIdOldLevel = LibEncode.hashKeyEntity(buildingType, buildingLevel - 1);
    uint256[] memory storageResources = maxResourceStorageComponent.getValue(buildingIdNewLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint32 playerResourceMaxStorage = LibStorage.getResourceMaxStorage(world, playerEntity, storageResources[i]);

      uint32 maxStorageIncrease = LibStorage.getResourceMaxStorage(world, buildingIdNewLevel, storageResources[i]);
      if (actionType == EActionType.Upgrade)
        maxStorageIncrease =
          maxStorageIncrease -
          LibStorage.getResourceMaxStorage(world, buildingIdOldLevel, storageResources[i]);
      updateResourceMaxStorage(
        world,
        playerEntity,
        storageResources[i],
        actionType == EActionType.Destroy
          ? playerResourceMaxStorage - maxStorageIncrease
          : playerResourceMaxStorage + maxStorageIncrease
      );
    }
  }

  function updateResourceMaxStorage(IWorld world, uint256 entity, uint256 resourceId, uint32 newMaxStorage) internal {
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(world.getComponent(MaxStorageComponentID));
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      world.getComponent(MaxResourceStorageComponentID)
    );
    uint256 resourceEntity = LibEncode.hashKeyEntity(resourceId, entity);
    if (!maxStorageComponent.has(resourceEntity)) {
      uint256[] memory storageResourceIds;
      if (maxResourceStorageComponent.has(entity)) {
        storageResourceIds = maxResourceStorageComponent.getValue(entity);
        uint256[] memory updatedResourceIds = new uint256[](storageResourceIds.length + 1);
        for (uint256 i = 0; i < storageResourceIds.length; i++) {
          updatedResourceIds[i] = storageResourceIds[i];
        }
        updatedResourceIds[storageResourceIds.length] = resourceId;
        maxResourceStorageComponent.set(entity, updatedResourceIds);
      } else {
        storageResourceIds = new uint256[](1);
        storageResourceIds[0] = resourceId;
        maxResourceStorageComponent.set(entity, storageResourceIds);
      }
    }
    maxStorageComponent.set(resourceEntity, newMaxStorage);

    uint32 playerResourceAmount = LibMath.getSafe(ItemComponent(world.getComponent(ItemComponentID)), resourceEntity);
    if (playerResourceAmount > newMaxStorage) {
      ItemComponent(world.getComponent(ItemComponentID)).set(resourceEntity, newMaxStorage);
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
