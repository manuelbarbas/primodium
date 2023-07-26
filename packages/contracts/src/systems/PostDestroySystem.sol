// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "components/BuildingTilesComponent.sol";

// types
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID, RequiredPassiveResourceData } from "components/RequiredPassiveResourceComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID } from "components/PassiveResourceProductionComponent.sol";
import { MainBaseID } from "../prototypes.sol";

import { ID as DestroySystemID } from "./DestroySystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { Coord } from "../types.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibStorageUpdate } from "../libraries/LibStorageUpdate.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.PostDestroy"));

contract PostDestroySystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function updatePassiveResourcesBasedOnRequirements(uint256 playerEntity, uint256 blockType) internal {
    RequiredPassiveResourceComponent requiredPassiveResourceComponent = RequiredPassiveResourceComponent(
      getAddressById(components, RequiredPassiveResourceComponentID)
    );
    if (requiredPassiveResourceComponent.has(blockType)) {
      ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));

      RequiredPassiveResourceData memory requiredPassiveResourceData = requiredPassiveResourceComponent.getValue(
        blockType
      );
      for (uint256 i = 0; i < requiredPassiveResourceData.ResourceIDs.length; i++) {
        uint256 playerResourceEntity = LibEncode.hashKeyEntity(
          requiredPassiveResourceData.ResourceIDs[i],
          playerEntity
        );
        itemComponent.set(
          playerResourceEntity,
          itemComponent.getValue(playerResourceEntity) - requiredPassiveResourceData.RequiredAmounts[i]
        );
      }
    }
  }

  function updatePassiveResourceProduction(uint256 playerEntity, uint256 blockType) internal {
    PassiveResourceProductionComponent passiveResourceProductionComponent = PassiveResourceProductionComponent(
      getAddressById(components, PassiveResourceProductionComponentID)
    );
    if (passiveResourceProductionComponent.has(blockType)) {
      uint256 resourceId = passiveResourceProductionComponent.getValue(blockType).ResourceID;
      StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
        getAddressById(components, StorageCapacityComponentID)
      );

      LibStorageUpdate.updateStorageCapacityOfResourceForEntity(
        StorageCapacityResourcesComponent(getAddressById(components, StorageCapacityResourcesComponentID)),
        storageCapacityComponent,
        playerEntity,
        resourceId,
        storageCapacityComponent.getValue(LibEncode.hashKeyEntity(resourceId, playerEntity)) -
          passiveResourceProductionComponent.getValue(blockType).ResourceProduction
      );
    }
  }

  function checkAndUpdatePlayerStorageAfterDestroy(
    uint256 playerEntity,
    uint256 buildingId,
    uint256 buildingLevel
  ) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(getC(StorageCapacityComponentID));
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getC(StorageCapacityResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getC(ItemComponentID));

    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingId, buildingLevel);
    if (!storageCapacityResourcesComponent.has(buildingIdLevel)) return;
    uint256[] memory storageResources = storageCapacityResourcesComponent.getValue(buildingIdLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], playerEntity);
      uint32 playerResourceStorageCapacity = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        playerEntity,
        storageResources[i]
      );
      uint32 storageCapacityIncrease = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        buildingIdLevel,
        storageResources[i]
      );
      LibStorageUpdate.updateStorageCapacityOfResourceForEntity(
        storageCapacityResourcesComponent,
        storageCapacityComponent,
        playerEntity,
        storageResources[i],
        playerResourceStorageCapacity - storageCapacityIncrease
      );

      uint32 playerResourceAmount = LibMath.getSafeUint32Value(itemComponent, playerResourceStorageEntity);
      if (playerResourceAmount > playerResourceStorageCapacity - storageCapacityIncrease) {
        itemComponent.set(playerResourceStorageEntity, playerResourceStorageCapacity - storageCapacityIncrease);
      }
    }
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), DestroySystemID),
      "PostUpgradeSystem: Only BuildSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);
    uint256 buildingType = TileComponent(getAddressById(components, TileComponentID)).getValue(buildingEntity);

    checkAndUpdatePlayerStorageAfterDestroy(
      playerEntity,
      buildingType,
      BuildingLevelComponent(getAddressById(components, BuildingLevelComponentID)).getValue(buildingEntity)
    );
    updatePassiveResourcesBasedOnRequirements(playerEntity, buildingType);
    updatePassiveResourceProduction(playerEntity, buildingType);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
