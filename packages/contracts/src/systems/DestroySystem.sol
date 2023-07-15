// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

// components
import { Uint256Component } from "std-contracts/components/Uint256Component.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingLevelComponent, ID as BuildingComponentID } from "components/BuildingLevelComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "components/BuildingTilesComponent.sol";

// types
import { MainBaseID } from "../prototypes/Tiles.sol";
import { BuildingKey, BuildingTileKey } from "../prototypes/Keys.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { RequiredPassiveResourceComponent, ID as RequiredPassiveResourceComponentID } from "components/RequiredPassiveResourceComponent.sol";
import { PassiveResourceProductionComponent, ID as PassiveResourceProductionComponentID } from "components/PassiveResourceProductionComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { ID as PostDestroyPathSystemID } from "./PostDestroyPathSystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

import { Coord } from "../types.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibStorageUpdate } from "../libraries/LibStorageUpdate.sol";

uint256 constant ID = uint256(keccak256("system.Destroy"));

contract DestroySystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function checkPassiveResourceRequirementsMetAfterDestroy(uint256 blockType) internal view returns (bool) {
    PassiveResourceProductionComponent passiveResourceProductionComponent = PassiveResourceProductionComponent(
      getAddressById(components, PassiveResourceProductionComponentID)
    );
    if (passiveResourceProductionComponent.has(blockType)) {
      uint256 playerEntity = addressToEntity(msg.sender);

      uint256 resourceId = passiveResourceProductionComponent.getValue(blockType).ResourceID;
      uint256 resourceProduction = passiveResourceProductionComponent.getValue(blockType).ResourceProduction;

      uint256 availableResourceAmount = LibStorage.getAvailableSpaceInStorageForResource(
        StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
        ItemComponent(getAddressById(components, ItemComponentID)),
        playerEntity,
        resourceId
      );
      return availableResourceAmount >= resourceProduction;
    }
    return true;
  }

  function updatePassiveResourcesBasedOnRequirements(uint256 blockType) internal {
    RequiredPassiveResourceComponent requiredPassiveResourceComponent = RequiredPassiveResourceComponent(
      getAddressById(components, RequiredPassiveResourceComponentID)
    );
    if (requiredPassiveResourceComponent.has(blockType)) {
      uint256 playerEntity = addressToEntity(msg.sender);
      ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
      uint256[] memory resourceIDs = requiredPassiveResourceComponent.getValue(blockType).ResourceIDs;
      uint256[] memory requiredAmounts = requiredPassiveResourceComponent.getValue(blockType).RequiredAmounts;

      for (uint256 i = 0; i < resourceIDs.length; i++) {
        uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceIDs[i], playerEntity);
        itemComponent.set(playerResourceEntity, itemComponent.getValue(playerResourceEntity) - requiredAmounts[i]);
      }
    }
  }

  function updatePassiveResourceProduction(uint256 blockType) internal {
    PassiveResourceProductionComponent passiveResourceProductionComponent = PassiveResourceProductionComponent(
      getAddressById(components, PassiveResourceProductionComponentID)
    );
    if (passiveResourceProductionComponent.has(blockType)) {
      uint256 resourceId = passiveResourceProductionComponent.getValue(blockType).ResourceID;
      StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
        getAddressById(components, StorageCapacityComponentID)
      );
      uint256 playerEntity = addressToEntity(msg.sender);
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

  function checkAndUpdatePlayerStorageAfterDestroy(uint256 buildingId, uint256 buildingLevel) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(getC(StorageCapacityComponentID));
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getC(StorageCapacityResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getC(ItemComponentID));

    uint256 playerEntity = addressToEntity(msg.sender);
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingId, buildingLevel);
    if (!storageCapacityResourcesComponent.has(buildingIdLevel)) return;
    uint256[] memory storageResources = storageCapacityResourcesComponent.getValue(buildingIdLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], playerEntity);
      uint256 playerResourceStorageCapacity = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        playerEntity,
        storageResources[i]
      );
      uint256 storageCapacityIncrease = LibStorage.getEntityStorageCapacityForResource(
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

      uint256 playerResourceAmount = LibMath.getSafeUint256Value(itemComponent, playerResourceStorageEntity);
      if (playerResourceAmount > playerResourceStorageCapacity - storageCapacityIncrease) {
        itemComponent.set(playerResourceStorageEntity, playerResourceStorageCapacity - storageCapacityIncrease);
      }
    }
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    TileComponent tileComponent = TileComponent(getC(TileComponentID));
    PathComponent pathComponent = PathComponent(getC(PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    BuildingTilesComponent buildingTilesComponent = BuildingTilesComponent(getC(BuildingTilesComponentID));
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID));
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(getC(BuildingLimitComponentID));
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(
      getAddressById(components, BuildingComponentID)
    );


    uint256 buildingEntity = getBuildingFromCoord(coord);
    uint256 playerEntity = addressToEntity(msg.sender);

    require(
      checkPassiveResourceRequirementsMetAfterDestroy(tileComponent.getValue(buildingEntity)),
      "[DestroySystem] can not destory passive resource production building if requirements are not met, destroy passive resource consumers first or increase passive resource production"
    );



    require(ownedByComponent.getValue(buildingEntity) == playerEntity, "[Destroy] : only owner can destroy building");

    uint256[] memory buildingTiles = buildingTilesComponent.getValue(buildingEntity);
    for (uint i = 0; i < buildingTiles.length; i++) {
      clearBuildingTile(ownedByComponent, buildingTiles[i]);
    }
    // for node tiles, check for paths that start or end at the current location and destroy associated paths
    if (pathComponent.has(buildingEntity)) {
      IOnEntitySubsystem(getAddressById(world.systems(), PostDestroyPathSystemID)).executeTyped(
        msg.sender,
        buildingEntity
      );
      pathComponent.remove(buildingEntity);
    }

    uint256[] memory pathWithEndingTile = pathComponent.getEntitiesWithValue(buildingEntity);
    if (pathWithEndingTile.length > 0) {
      for (uint256 i = 0; i < pathWithEndingTile.length; i++) {
        IOnEntitySubsystem(getAddressById(world.systems(), PostDestroyPathSystemID)).executeTyped(
          msg.sender,
          pathWithEndingTile[i]
        );
        pathComponent.remove(pathWithEndingTile[i]);
      }
    }

    uint256 buildingType = tileComponent.getValue(buildingEntity);
    // for main base tile, remove main base initialized.
    if (buildingType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getC(MainBaseInitializedComponentID)
      );
      mainBaseInitializedComponent.remove(playerEntity);
    }

    if (!ignoreBuildLimitComponent.has(buildingType)) {
      buildingLimitComponent.set(playerEntity, LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity) - 1);
    }
    checkAndUpdatePlayerStorageAfterDestroy(buildingType, buildingLevelComponent.getValue(buildingEntity));
    updatePassiveResourcesBasedOnRequirements(buildingType);
    updatePassiveResourceProduction(buildingType);
    
    buildingLevelComponent.remove(buildingEntity);
    tileComponent.remove(buildingEntity);
    ownedByComponent.remove(buildingEntity);
    LastBuiltAtComponent(getC(LastBuiltAtComponentID)).remove(buildingEntity);
    LastClaimedAtComponent(getC(LastClaimedAtComponentID)).remove(buildingEntity);
    buildingTilesComponent.remove(buildingEntity);
    return abi.encode(buildingEntity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }

  function clearBuildingTile(Uint256Component ownedByComponent, uint256 tileEntity) private {
    require(ownedByComponent.has(tileEntity), "[DestroySystem] Cannot destroy unowned coordinate");
    ownedByComponent.remove(tileEntity);
  }
}
