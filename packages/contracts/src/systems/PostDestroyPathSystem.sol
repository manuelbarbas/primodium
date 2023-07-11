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
import { BuildingLevelComponent, ID as BuildingComponentID } from "components/BuildingLevelComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { MainBaseID } from "../prototypes/Tiles.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibPath } from "../libraries/LibPath.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";

import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.PostDestroyPath"));

contract PostDestroyPathSystem is IOnEntitySubsystem, System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(
    MineComponent mineComponent,
    LastClaimedAtComponent lastClaimedAtComponent,
    uint256 playerEntity,
    uint256 resourceId
  ) internal {
    LibUnclaimedResource.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      lastClaimedAtComponent,
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
    LastClaimedAtComponent lastClaimedAtComponent,
    uint256 playerEntity,
    uint256 mineEntity
  ) internal {
    // update unclaimed resources
    updateUnclaimedForResource(
      mineComponent,
      lastClaimedAtComponent,
      playerEntity,
      LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity))
    );
    // when path from mine to main base is destroyed resource production is reduced by the mines resource production
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(
      getAddressById(components, BuildingComponentID)
    );
    uint256 buildingId = tileComponent.getValue(mineEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, buildingLevelComponent.getValue(mineEntity));
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity));
    uint256 resourceProductionOfMine = mineComponent.getValue(buildingLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    LibResourceProduction.updateResourceProduction(
      mineComponent,
      lastClaimedAtComponent,
      playerResourceEntity,
      mineComponent.getValue(playerResourceEntity) - resourceProductionOfMine
    );
  }

  function handleOnDestroyPathFromMineToFactory(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    TileComponent tileComponent,
    BuildingLevelComponent buildingLevelComponent,
    MineComponent mineComponent,
    LastClaimedAtComponent lastClaimedAtComponent,
    uint256 playerEntity,
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
      buildingLevelComponent.getValue(factoryEntity)
    );

    if (isFunctional) {
      // update unclaimed resources
      updateUnclaimedForResource(
        mineComponent,
        lastClaimedAtComponent,
        playerEntity,
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
        lastClaimedAtComponent,
        playerEntity,
        factoryBuildingLevelEntity,
        false
      );
  }

  function handleOnDestroyPathFromFactoryToMainBase(
    MineComponent mineComponent,
    BuildingLevelComponent buildingLevelComponent,
    TileComponent tileComponent,
    LastClaimedAtComponent lastClaimedAtComponent,
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
      buildingLevelComponent.getValue(factoryEntity)
    );
    // update unclaimed resources
    updateUnclaimedForResource(
      mineComponent,
      lastClaimedAtComponent,
      playerEntity,
      factoryProductionComponent.getValue(factoryBuildingLevelEntity).ResourceID
    );
    FactoryProductionData memory factoryProductionData = factoryProductionComponent.getValue(
      factoryBuildingLevelEntity
    );
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    //update resource production
    LibResourceProduction.updateResourceProduction(
      mineComponent,
      lastClaimedAtComponent,
      playerResourceEntity,
      mineComponent.getValue(playerResourceEntity) - factoryProductionData.ResourceProductionRate
    );
  }

  function execute(bytes memory args) public returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), DestroyPathSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "[PostDestroyPathSystem] - Invalid sender. Can only be called from DestroyPathSystem or DestroySystem]"
    );
    (address playerAddress, uint256 startCoordEntity) = abi.decode(args, (address, uint256));
    uint256 endCoordEntity = PathComponent(getAddressById(components, PathComponentID)).getValue(startCoordEntity);

    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(
      getAddressById(components, BuildingComponentID)
    );
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    LastClaimedAtComponent lastClaimedAtComponent = LastClaimedAtComponent(
      getAddressById(components, LastClaimedAtComponentID)
    );
    uint256 startCoordBuildingLevelEntity = LibEncode.hashKeyEntity(
      tileComponent.getValue(startCoordEntity),
      buildingLevelComponent.getValue(startCoordEntity)
    );
    if (mineComponent.has(startCoordBuildingLevelEntity)) {
      if (tileComponent.getValue(endCoordEntity) == MainBaseID) {
        handleOnDestroyPathFromMineToMainBase(
          mineComponent,
          tileComponent,
          lastClaimedAtComponent,
          addressToEntity(playerAddress),
          startCoordEntity
        );
      } else {
        handleOnDestroyPathFromMineToFactory(
          factoryMineBuildingsComponent,
          tileComponent,
          buildingLevelComponent,
          mineComponent,
          lastClaimedAtComponent,
          addressToEntity(playerAddress),
          startCoordEntity,
          endCoordEntity
        );
      }
    } else if (factoryMineBuildingsComponent.has(startCoordBuildingLevelEntity)) {
      handleOnDestroyPathFromFactoryToMainBase(
        mineComponent,
        buildingLevelComponent,
        tileComponent,
        lastClaimedAtComponent,
        addressToEntity(playerAddress),
        startCoordEntity
      );
    }
    return abi.encode(playerAddress, startCoordEntity, endCoordEntity);
  }

  function executeTyped(address playerAddress, uint256 startCoordEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, startCoordEntity));
  }
}
