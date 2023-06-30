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
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID } from "components/FactoryProductionComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibPath } from "../libraries/LibPath.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
uint256 constant ID = uint256(keccak256("system.BuildPath"));

contract BuildPathSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(
    MineComponent mineComponent,
    StorageCapacityComponent storageCapacityComponent,
    uint256 playerEntity,
    uint256 startCoordEntity
  ) internal {
    LibNewMine.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      mineComponent,
      storageCapacityComponent,
      ItemComponent(getAddressById(components, ItemComponentID)),
      playerEntity,
      LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(startCoordEntity))
    );
  }

  function handleBuildingPathFromMineToMainBase(uint256 mineEntity) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));

    //update unclaimed resources before updating resouce production
    updateUnclaimedForResource(mineComponent, storageCapacityComponent, addressToEntity(msg.sender), mineEntity);
    //update resource production based on new path
    LibNewMine.updateResourceProductionOnBuildPathFromMine(
      mineComponent,
      buildingComponent,
      tileComponent,
      addressToEntity(msg.sender),
      mineEntity
    );
  }

  function handleBuildingPathFromMineToFactory(uint256 mineEntity, uint256 factoryEntity) internal {
    FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
      getAddressById(components, FactoryIsFunctionalComponentID)
    );
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));

    require(
      factoryMineBuildingsComponent.has(
        LibEncode.hashKeyEntity(tileComponent.getValue(factoryEntity), buildingComponent.getValue(factoryEntity))
      ),
      "[BuildPathSystem] Cannot build path a building which is not MainBase or a factory"
    );
    require(
      LibFactory.checkOnBuildPathFromMineToFactory(
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
        tileComponent,
        buildingComponent,
        addressToEntity(msg.sender),
        factoryEntity,
        true
      );
    }
  }

  function handleBuildingPathFromFactoryToMainBase(uint256 factoryEntity, uint256 mainBaseEntity) internal {
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    require(
      tileComponent.getValue(mainBaseEntity) == MainBaseID,
      "[BuildPathSystem] Cannot build path from a factory to any building other then MainBase"
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
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));

    updateUnclaimedForResource(mineComponent, storageCapacityComponent, addressToEntity(msg.sender), factoryEntity);
    LibFactory.updateResourceProductionOnBuildPathFromFactoryToMainBase(
      factoryProductionComponent,
      factoryIsFunctionalComponent,
      mineComponent,
      buildingComponent,
      tileComponent,
      addressToEntity(msg.sender),
      factoryEntity
    );
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
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(startCoordEntity);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[BuildPathSystem] Cannot start path at a tile you do not own"
    );
    uint256 ownedEntityAtEndCoord = ownedByComponent.getValue(endCoordEntity);
    require(
      ownedEntityAtEndCoord == addressToEntity(msg.sender),
      "[BuildPathSystem] Cannot end path at a tile you do not own"
    );

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
        handleBuildingPathFromMineToMainBase(startCoordEntity);
      } else {
        handleBuildingPathFromMineToFactory(startCoordEntity, endCoordEntity);
      }
    } else if (factoryMineBuildingsComponent.has(startCoordBuildingLevelEntity)) {
      handleBuildingPathFromFactoryToMainBase(startCoordEntity, endCoordEntity);
    }

    // Add key
    pathComponent.set(startCoordEntity, endCoordEntity);

    //update unclaimed resources before updating resouce production

    return abi.encode(startCoordEntity);
  }

  function executeTyped(Coord memory coordStart, Coord memory coordEnd) public returns (bytes memory) {
    return execute(abi.encode(coordStart, coordEnd));
  }
}
