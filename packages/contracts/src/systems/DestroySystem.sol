// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibMath } from "../libraries/LibMath.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";

uint256 constant ID = uint256(keccak256("system.Destroy"));

contract DestroySystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function checkAndUpdatePlayerStorageAfterDestroy(uint256 buildingId, uint256 buildingLevel) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));

    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingId, buildingLevel);
    if (!storageCapacityResourcesComponent.has(buildingIdLevel)) return;
    uint256[] memory storageResources = storageCapacityResourcesComponent.getValue(buildingIdLevel);
    uint256 playerEntity = addressToEntity(msg.sender);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], playerEntity);
      uint256 playerResourceStorageCapacity = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        playerResourceStorageEntity,
        storageResources[i]
      );
      uint256 storageCapacityIncrease = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        buildingIdLevel,
        storageResources[i]
      );
      storageCapacityComponent.set(
        playerResourceStorageEntity,
        playerResourceStorageCapacity - storageCapacityIncrease
      );
      uint256 playerResourceAmount = LibMath.getSafeUint256Value(
        itemComponent,
        LibEncode.hashKeyEntity(storageResources[i], playerEntity)
      );
      if (playerResourceAmount > playerResourceStorageCapacity) {
        itemComponent.set(
          LibEncode.hashKeyEntity(storageResources[i], playerEntity),
          playerResourceStorageCapacity - storageCapacityIncrease
        );
      }
    }
  }

  function execute(bytes memory args) public returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    LastBuiltAtComponent lastBuiltAtComponent = LastBuiltAtComponent(
      getAddressById(components, LastBuiltAtComponentID)
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(components, IgnoreBuildLimitComponentID)
    );
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(
      getAddressById(components, BuildingLimitComponentID)
    );
    // Check there isn't another tile there
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(tileComponent.has(entity), "[DestroySystem] Cannot destroy tile at an empty coordinate");

    // for node tiles, check for paths that start or end at the current location and destroy associated paths
    if (pathComponent.has(entity)) {
      pathComponent.remove(entity);
    }

    uint256[] memory pathWithEndingTile = pathComponent.getEntitiesWithValue(entity);
    if (pathWithEndingTile.length > 0) {
      for (uint256 i = 0; i < pathWithEndingTile.length; i++) {
        pathComponent.remove(pathWithEndingTile[i]);
      }
    }

    // for main base tile, remove main base initialized.
    if (tileComponent.getValue(entity) == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getAddressById(components, MainBaseInitializedComponentID)
      );
      mainBaseInitializedComponent.remove(addressToEntity(msg.sender));
    }

    if (LibBuilding.doesTileCountTowardsBuildingLimit(ignoreBuildLimitComponent, tileComponent.getValue(entity))) {
      buildingLimitComponent.set(
        addressToEntity(msg.sender),
        LibMath.getSafeUint256Value(buildingLimitComponent, addressToEntity(msg.sender)) - 1
      );
    }

    checkAndUpdatePlayerStorageAfterDestroy(tileComponent.getValue(entity), buildingComponent.getValue(entity));

    buildingComponent.remove(entity);
    tileComponent.remove(entity);
    ownedByComponent.remove(entity);
    lastBuiltAtComponent.remove(entity);
    lastClaimedAtComponent.remove(entity);

    return abi.encode(entity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
