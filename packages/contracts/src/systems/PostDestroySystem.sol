// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "components/MaxBuildingsComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";

// types
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { OwnedResourcesComponent, ID as OwnedResourcesComponentID } from "components/OwnedResourcesComponent.sol";
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
      MaxStorageComponent maxStorageComponent = MaxStorageComponent(getAddressById(components, MaxStorageComponentID));

      LibStorageUpdate.updateMaxStorageOfResourceForEntity(
        OwnedResourcesComponent(getAddressById(components, OwnedResourcesComponentID)),
        maxStorageComponent,
        playerEntity,
        resourceId,
        maxStorageComponent.getValue(LibEncode.hashKeyEntity(resourceId, playerEntity)) -
          passiveResourceProductionComponent.getValue(blockType).ResourceProduction
      );
    }
  }

  function checkAndUpdatePlayerStorageAfterDestroy(uint256 playerEntity, uint256 buildingId, uint256 level) internal {
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(getC(MaxStorageComponentID));
    OwnedResourcesComponent ownedResourcesComponent = OwnedResourcesComponent(getC(OwnedResourcesComponentID));
    ItemComponent itemComponent = ItemComponent(getC(ItemComponentID));

    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingId, level);
    if (!ownedResourcesComponent.has(buildingIdLevel)) return;
    uint256[] memory storageResources = ownedResourcesComponent.getValue(buildingIdLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], playerEntity);
      uint32 playerResourceMaxStorage = LibStorage.getEntityMaxStorageForResource(
        maxStorageComponent,
        playerEntity,
        storageResources[i]
      );
      uint32 maxStorageIncrease = LibStorage.getEntityMaxStorageForResource(
        maxStorageComponent,
        buildingIdLevel,
        storageResources[i]
      );
      LibStorageUpdate.updateMaxStorageOfResourceForEntity(
        ownedResourcesComponent,
        maxStorageComponent,
        playerEntity,
        storageResources[i],
        playerResourceMaxStorage - maxStorageIncrease
      );

      uint32 playerResourceAmount = LibMath.getSafeUint32Value(itemComponent, playerResourceStorageEntity);
      if (playerResourceAmount > playerResourceMaxStorage - maxStorageIncrease) {
        itemComponent.set(playerResourceStorageEntity, playerResourceMaxStorage - maxStorageIncrease);
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
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(buildingEntity)
    );
    updatePassiveResourcesBasedOnRequirements(playerEntity, buildingType);
    updatePassiveResourceProduction(playerEntity, buildingType);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
