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
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { DebugNodeID, NodeID, MainBaseID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibPath } from "../libraries/LibPath.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibClaim } from "../libraries/LibClaim.sol";
uint256 constant ID = uint256(keccak256("system.DestroyPath"));

contract DestroyPathSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(MineComponent mineComponent, uint256 playerEntity, uint256 resourceId) internal {
    LibClaim.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      mineComponent,
      StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
      ItemComponent(getAddressById(components, ItemComponentID)),
      playerEntity,
      resourceId
    );
  }

  function handleOnDestroyPathFromMineToMainBase(
    MineComponent mineComponent,
    TileComponent tileComponent,
    uint256 mineEntity
  ) internal {
    // update unclaimed resources
    updateUnclaimedForResource(
      mineComponent,
      addressToEntity(msg.sender),
      LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity))
    );
    // when path from mine to main base is destroyed resource production is reduced by the mines resource production
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    uint256 buildingId = tileComponent.getValue(mineEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingComponent.getValue(mineEntity));
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity));
    uint256 resourceProductionOfMine = mineComponent.getValue(buildingLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, addressToEntity(msg.sender));
    mineComponent.set(playerResourceEntity, mineComponent.getValue(playerResourceEntity) - resourceProductionOfMine);
  }

  function handleOnDestroyPathFromMineToFactory(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    TileComponent tileComponent,
    BuildingComponent buildingComponent,
    MineComponent mineComponent,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal {
    FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
      getAddressById(components, FactoryIsFunctionalComponentID)
    );

    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );

    bool isFunctional = factoryIsFunctionalComponent.has(factoryEntity);
    uint256 factoryBuildingLevelEntity = LibEncode.hashKeyEntity(
      tileComponent.getValue(factoryEntity),
      buildingComponent.getValue(factoryEntity)
    );

    if (isFunctional) {
      // update unclaimed resources
      updateUnclaimedForResource(
        mineComponent,
        addressToEntity(msg.sender),
        factoryProductionComponent.getValue(factoryBuildingLevelEntity).ResourceID
      );
    }

    //when a path from mine to factory is destroyed, factory becomes non functional
    //and required connected mine building count is increased
    factoryIsFunctionalComponent.remove(factoryEntity);

    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingIDs[i] == tileComponent.getValue(mineEntity)) {
        factoryMineBuildingsData.MineBuildingCount[i]++;
        factoryMineBuildingsComponent.set(factoryEntity, factoryMineBuildingsData);
        break;
      }
    }

    //if factory was functional player resource production must be cecreased by the resource production of the factory
    if (isFunctional)
      LibFactory.updateResourceProductionOnFactoryIsFunctionalChange(
        factoryProductionComponent,
        mineComponent,
        addressToEntity(msg.sender),
        factoryBuildingLevelEntity,
        false
      );
  }

  function handleOnDestroyPathFromFactoryToMainBase(
    MineComponent mineComponent,
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    uint256 playerEntity,
    uint256 factoryEntity
  ) internal {
    FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
      getAddressById(components, FactoryIsFunctionalComponentID)
    );
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );

    // if factory was non functional before path was destroyed, nothing to change
    if (!factoryIsFunctionalComponent.has(factoryEntity)) return;

    // when path from factory to main base is destroyed, factory becomes non functional
    // and the resource production must be modified

    // first update unclaimed resources so the unclaimed resource value up to this point is calculated
    uint256 factoryBuildingLevelEntity = LibEncode.hashKeyEntity(
      tileComponent.getValue(factoryEntity),
      buildingComponent.getValue(factoryEntity)
    );
    // update unclaimed resources
    updateUnclaimedForResource(
      mineComponent,
      addressToEntity(msg.sender),
      factoryProductionComponent.getValue(factoryBuildingLevelEntity).ResourceID
    );
    FactoryProductionData memory factoryProductionData = factoryProductionComponent.getValue(
      factoryBuildingLevelEntity
    );
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    //update resource production
    mineComponent.set(
      playerResourceEntity,
      mineComponent.getValue(playerResourceEntity) - factoryProductionData.ResourceProductionRate
    );
  }

  function execute(bytes memory args) public returns (bytes memory) {
    Coord memory coordStart = abi.decode(args, (Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));

    // Check that the coordinates exist tiles
    uint256 startCoordEntity = LibEncode.encodeCoordEntity(coordStart, BuildingKey);
    require(tileComponent.has(startCoordEntity), "[DestroyPathSystem] Cannot destroy path from an empty coordinate");

    // Check that the coordinates are both owned by the msg.sender
    uint256 ownedEntityAtStartCoord = ownedByComponent.getValue(startCoordEntity);
    require(
      ownedEntityAtStartCoord == addressToEntity(msg.sender),
      "[DestroyPathSystem] Cannot destroy path from a tile you do not own"
    );

    // Check that a path doesn't already start there (each tile can only be the start of one path)
    require(ownedByComponent.has(startCoordEntity), "[DestroyPathSystem] Path does not exist at the selected tile");
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));

    // remove key
    uint256 endCoordEntity = pathComponent.getValue(startCoordEntity);
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    uint256 startCoordBuildingId = tileComponent.getValue(startCoordEntity);
    uint256 endCoordBuildingId = tileComponent.getValue(endCoordEntity);
    uint256 startCoordBuildingLevelEntity = LibEncode.hashKeyEntity(
      startCoordBuildingId,
      buildingComponent.getValue(startCoordEntity)
    );
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    if (mineComponent.has(startCoordBuildingLevelEntity)) {
      if (endCoordBuildingId == MainBaseID) {
        handleOnDestroyPathFromMineToMainBase(mineComponent, tileComponent, startCoordEntity);
      } else {
        handleOnDestroyPathFromMineToFactory(
          factoryMineBuildingsComponent,
          tileComponent,
          buildingComponent,
          mineComponent,
          startCoordEntity,
          endCoordEntity
        );
      }
    } else if (factoryMineBuildingsComponent.has(startCoordBuildingLevelEntity)) {
      handleOnDestroyPathFromFactoryToMainBase(
        mineComponent,
        buildingComponent,
        tileComponent,
        addressToEntity(msg.sender),
        startCoordEntity
      );
    }

    pathComponent.remove(startCoordEntity);

    return abi.encode(startCoordEntity);
  }

  function executeTyped(Coord memory coordStart) public returns (bytes memory) {
    return execute(abi.encode(coordStart));
  }
}
