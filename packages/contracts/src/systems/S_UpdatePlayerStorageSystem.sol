// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "./BuildSystem.sol";
import { ID as SpawnSystemID } from "./SpawnSystem.sol";
import { ID as UpgradeBuildingSystemID } from "./UpgradeBuildingSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { IOnBuildingSubsystem, EActionType } from "../interfaces/IOnBuildingSubsystem.sol";
import { ID as S_UpdateUnclaimedResourcesSystemID } from "./S_UpdateUnclaimedResourcesSystem.sol";
import { ItemComponent, ID as ItemComponentID } from "../components/ItemComponent.sol";
import { P_MaxStorageComponent, ID as P_MaxStorageComponentID } from "../components/P_MaxStorageComponent.sol";
import { P_MaxResourceStorageComponent, ID as P_MaxResourceStorageComponentID } from "../components/P_MaxResourceStorageComponent.sol";

import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "../components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "../components/LevelComponent.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibResource } from "../libraries/LibResource.sol";

uint256 constant ID = uint256(keccak256("system.S_UpdatePlayerStorage"));

contract S_UpdatePlayerStorageSystem is IOnBuildingSubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID) ||
        msg.sender == getAddressById(world.systems(), SpawnSystemID) ||
        msg.sender == getAddressById(world.systems(), UpgradeBuildingSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "S_UpdatePlayerStorageSystem: Only BuildSystem, SpawnSystem, UpgradeBuildingSystem, DestroySystem can call this function"
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
    P_MaxResourceStorageComponent p_MaxResourceStorageComponent = P_MaxResourceStorageComponent(
      world.getComponent(P_MaxResourceStorageComponentID)
    );

    uint256 buildingIdNewLevel = LibEncode.hashKeyEntity(buildingType, buildingLevel);

    uint256[] memory storageResources = p_MaxResourceStorageComponent.getValue(buildingIdNewLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint32 playerResourceMaxStorage = LibStorage.getResourceMaxStorage(world, playerEntity, storageResources[i]);

      uint32 maxStorageIncrease = LibStorage.getResourceMaxStorage(world, buildingIdNewLevel, storageResources[i]);
      if (actionType == EActionType.Upgrade) {
        uint256 buildingIdOldLevel = LibEncode.hashKeyEntity(buildingType, buildingLevel - 1);
        maxStorageIncrease =
          maxStorageIncrease -
          LibStorage.getResourceMaxStorage(world, buildingIdOldLevel, storageResources[i]);
      }
      IOnEntitySubsystem(getAddressById(world.systems(), S_UpdateUnclaimedResourcesSystemID)).executeTyped(
        playerAddress,
        storageResources[i]
      );
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
    P_MaxStorageComponent maxStorageComponent = P_MaxStorageComponent(world.getComponent(P_MaxStorageComponentID));
    P_MaxResourceStorageComponent maxResourceStorageComponent = P_MaxResourceStorageComponent(
      world.getComponent(P_MaxResourceStorageComponentID)
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
      LibResource.updateResourceAmount(world, entity, resourceId, newMaxStorage);
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
