// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "components/UnclaimedResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibPath } from "../libraries/LibPath.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";
uint256 constant ID = uint256(keccak256("system.BuildPath"));

contract BuildPathSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  //call after upgrade has been done and level has been increased
  function updateResourceProductionOnBuildPathFromFactoryToMainBase(
    FactoryProductionComponent factoryProductionComponent,
    FactoryIsFunctionalComponent factoryIsFunctionalComponent,
    MineComponent mineComponent, //writes to
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    LastClaimedAtComponent lastClaimedAtComponent,
    uint256 playerEntity,
    uint256 factoryEntity
  ) internal {
    if (!factoryIsFunctionalComponent.has(factoryEntity)) return;
    uint256 buildingId = tileComponent.getValue(factoryEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(factoryEntity));
    FactoryProductionData memory factoryProductionData = factoryProductionComponent.getValue(buildingLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    LibResourceProduction.updateResourceProduction(
      mineComponent,
      lastClaimedAtComponent,
      playerResourceEntity,
      LibMath.getSafeUint256Value(mineComponent, playerResourceEntity) + factoryProductionData.ResourceProductionRate
    );
  }

  //checks if path from mine to factory can be built, if yes updates factory is functional status
  function checkOnBuildPathFromMineToFactory(
    FactoryIsFunctionalComponent factoryIsFunctionalComponent,
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    PathComponent pathComponent,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal returns (bool) {
    if (factoryIsFunctionalComponent.has(factoryEntity)) return false;
    uint256 factoryLevel = buildingComponent.getValue(factoryEntity);
    bool isFunctional = true;
    bool isMineConnected = false;
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingIDs[i] == tileComponent.getValue(mineEntity)) {
        if (factoryMineBuildingsData.MineBuildingCount[i] <= 0) return false;
        factoryMineBuildingsData.MineBuildingCount[i]--;
        factoryMineBuildingsComponent.set(factoryEntity, factoryMineBuildingsData);
        isMineConnected = true;
        if (factoryMineBuildingsData.MineBuildingCount[i] > 0) isFunctional = false;
        if (buildingComponent.getValue(mineEntity) < factoryLevel) isFunctional = false;
      } else {
        if (factoryMineBuildingsData.MineBuildingCount[i] > 0) isFunctional = false;
      }
    }

    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
        isFunctional = false;
        return isMineConnected;
      }
    }

    if (isFunctional) {
      factoryIsFunctionalComponent.set(factoryEntity);
    }

    return isMineConnected;
  }

  function updateUnclaimedForResource(
    MineComponent mineComponent,
    StorageCapacityComponent storageCapacityComponent,
    LastClaimedAtComponent lastClaimedAtComponent,
    uint256 playerEntity,
    uint256 startCoordEntity
  ) internal {
    LibUnclaimedResource.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      lastClaimedAtComponent,
      mineComponent,
      storageCapacityComponent,
      ItemComponent(getAddressById(components, ItemComponentID)),
      playerEntity,
      LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(startCoordEntity))
    );
  }

  function handleBuildingPathFromMineToMainBase(
    TileComponent tileComponent,
    BuildingComponent buildingComponent,
    MineComponent mineComponent,
    uint256 mineEntity
  ) internal {
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );

    //update unclaimed resources before updating resouce production
    updateUnclaimedForResource(
      mineComponent,
      storageCapacityComponent,
      lastClaimedAtComponent,
      addressToEntity(msg.sender),
      mineEntity
    );
    //update resource production based on new path
    updateResourceProductionOnBuildPathFromMine(
      mineComponent,
      buildingComponent,
      tileComponent,
      lastClaimedAtComponent,
      addressToEntity(msg.sender),
      mineEntity
    );
  }

  function updateResourceProductionOnBuildPathFromMine(
    MineComponent mineComponent, //writes to
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    LastClaimedAtComponent lastClaimedAtComponent,
    uint256 playerEntity,
    uint256 fromEntity
  ) internal {
    uint256 buildingId = tileComponent.getValue(fromEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(fromEntity));
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(fromEntity));
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    require(mineComponent.has(buildingLevelEntity), "Mine level entity not found");
    LibResourceProduction.updateResourceProduction(
      mineComponent,
      lastClaimedAtComponent,
      playerResourceEntity,
      LibMath.getSafeUint256Value(mineComponent, playerResourceEntity) + mineComponent.getValue(buildingLevelEntity)
    );
  }

  function handleBuildingPathFromMineToFactory(
    TileComponent tileComponent,
    BuildingComponent buildingComponent,
    MineComponent mineComponent,
    PathComponent pathComponent,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal {
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );
    FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
      getAddressById(components, FactoryIsFunctionalComponentID)
    );
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );

    uint256 factoryBuildingLevelEntity = LibEncode.hashKeyEntity(
      tileComponent.getValue(factoryEntity),
      buildingComponent.getValue(factoryEntity)
    );
    require(
      factoryMineBuildingsComponent.has(factoryBuildingLevelEntity),
      "[BuildPathSystem] Cannot build path a building which is not MainBase or a factory"
    );
    require(
      checkOnBuildPathFromMineToFactory(
        factoryIsFunctionalComponent,
        factoryMineBuildingsComponent,
        buildingComponent,
        tileComponent,
        pathComponent,
        mineEntity,
        factoryEntity
      ),
      "[BuildPathSystem] Cannot build path to a the target factory"
    );
    if (factoryIsFunctionalComponent.has(factoryEntity) && pathComponent.has(factoryEntity)) {
      FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
        getAddressById(components, FactoryProductionComponentID)
      );
      LibFactory.updateResourceProductionOnFactoryIsFunctionalChange(
        factoryProductionComponent,
        mineComponent,
        lastClaimedAtComponent,
        addressToEntity(msg.sender),
        factoryBuildingLevelEntity,
        true
      );
    }
  }

  function handleBuildingPathFromFactoryToMainBase(
    TileComponent tileComponent,
    MineComponent mineComponent,
    BuildingComponent buildingComponent,
    uint256 factoryEntity,
    uint256 mainBaseEntity
  ) internal {
    require(
      tileComponent.getValue(mainBaseEntity) == MainBaseID,
      "[BuildPathSystem] Cannot build path from a factory to any building other then MainBase"
    );
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );
    FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
      getAddressById(components, FactoryIsFunctionalComponentID)
    );
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );

    updateUnclaimedForResource(
      mineComponent,
      storageCapacityComponent,
      lastClaimedAtComponent,
      addressToEntity(msg.sender),
      factoryEntity
    );

    updateResourceProductionOnBuildPathFromFactoryToMainBase(
      factoryProductionComponent,
      factoryIsFunctionalComponent,
      mineComponent,
      buildingComponent,
      tileComponent,
      lastClaimedAtComponent,
      addressToEntity(msg.sender),
      factoryEntity
    );
  }

  function checkOwnership(uint256 fromEntity, uint256 toEntity) internal view returns (bool) {
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    return
      ownedByComponent.getValue(fromEntity) == addressToEntity(msg.sender) &&
      ownedByComponent.getValue(toEntity) == addressToEntity(msg.sender);
  }

  function execute(bytes memory args) public returns (bytes memory) {
    (Coord memory coordStart, Coord memory coordEnd) = abi.decode(args, (Coord, Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    require(
      !(coordStart.x == coordEnd.x && coordStart.y == coordEnd.y),
      "[BuildPathSystem] Cannot start and end path at the same coordinate"
    );

    // Check that the coordinates exist tiles
    uint256 startCoordEntity = LibEncode.encodeCoordEntity(coordStart, BuildingKey);
    require(tileComponent.has(startCoordEntity), "[BuildPathSystem] Cannot start path at an empty coordinate");
    uint256 endCoordEntity = LibEncode.encodeCoordEntity(coordEnd, BuildingKey);
    require(tileComponent.has(endCoordEntity), "[BuildPathSystem] Cannot end path at an empty coordinate");

    // Check that the coordinates are both owned by the msg.sender
    require(checkOwnership(startCoordEntity, endCoordEntity), "[BuildPathSystem] Cannot build path on unowned tiles");

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(
      !pathComponent.has(startCoordEntity),
      "[BuildPathSystem] Cannot start more than one path from the same tile"
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    uint256 startCoordBuildingId = tileComponent.getValue(startCoordEntity);
    uint256 endCoordBuildingId = tileComponent.getValue(endCoordEntity);
    uint256 startCoordBuildingLevelEntity = LibEncode.hashKeyEntity(
      startCoordBuildingId,
      buildingComponent.getValue(startCoordEntity)
    );

    if (mineComponent.has(startCoordBuildingLevelEntity)) {
      if (endCoordBuildingId == MainBaseID) {
        handleBuildingPathFromMineToMainBase(tileComponent, buildingComponent, mineComponent, startCoordEntity);
      } else {
        handleBuildingPathFromMineToFactory(
          tileComponent,
          buildingComponent,
          mineComponent,
          pathComponent,
          startCoordEntity,
          endCoordEntity
        );
      }
    } else if (factoryMineBuildingsComponent.has(startCoordBuildingLevelEntity)) {
      handleBuildingPathFromFactoryToMainBase(
        tileComponent,
        mineComponent,
        buildingComponent,
        startCoordEntity,
        endCoordEntity
      );
    }

    // Add key
    pathComponent.set(startCoordEntity, endCoordEntity);

    return abi.encode(startCoordEntity);
  }

  function executeTyped(Coord memory coordStart, Coord memory coordEnd) public returns (bytes memory) {
    return execute(abi.encode(coordStart, coordEnd));
  }
}
