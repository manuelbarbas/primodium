// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";

import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { UnclaimedResourceComponent, ID as UnclaimedResourceComponentID } from "components/UnclaimedResourceComponent.sol";
import { LastClaimedAtComponent, ID as LastClaimedAtComponentID } from "components/LastClaimedAtComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";
uint256 constant ID = uint256(keccak256("system.PostUpgrade"));

contract PostUpgradeSystem is IOnEntitySubsystem, System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(MineComponent mineComponent, uint256 playerEntity, uint256 resourceId) internal {
    LibUnclaimedResource.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      mineComponent,
      StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
      ItemComponent(getAddressById(components, ItemComponentID)),
      playerEntity,
      resourceId
    );
  }

  //after building level is increased
  function checkAndUpdatePlayerStorageAfterUpgrade(
    uint256 playerEntity,
    uint256 buildingId,
    uint256 newLevel
  ) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );
    uint256 buildingIdNewLevel = LibEncode.hashFromKey(buildingId, newLevel);
    uint256 buildingIdOldLevel = LibEncode.hashFromKey(buildingId, newLevel - 1);
    if (!storageCapacityResourcesComponent.has(buildingIdNewLevel)) return;
    uint256[] memory storageResources = storageCapacityResourcesComponent.getValue(buildingIdNewLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], playerEntity);
      uint256 playerResourceStorageCapacity = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        playerResourceStorageEntity,
        storageResources[i]
      );
      uint256 storageCapacityIncrease = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        buildingIdNewLevel,
        storageResources[i]
      ) -
        (
          storageCapacityResourcesComponent.has(buildingIdOldLevel)
            ? LibStorage.getEntityStorageCapacityForResource(
              storageCapacityComponent,
              buildingIdOldLevel,
              storageResources[i]
            )
            : 0
        );
      storageCapacityComponent.set(
        playerResourceStorageEntity,
        playerResourceStorageCapacity + storageCapacityIncrease
      );
    }
  }

  function checkFactoryConnectedMinesLevelCondition(
    FactoryIsFunctionalComponent factoryIsFunctionalComponent,
    BuildingComponent buildingComponent,
    PathComponent pathComponent,
    uint256 factoryEntity
  ) internal view returns (bool) {
    if (!factoryIsFunctionalComponent.has(factoryEntity)) return false;
    uint256 factoryLevel = buildingComponent.getValue(factoryEntity);
    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingComponent.getValue(connectedMineEntities[i]) < factoryLevel) return false;
    }
    return true;
  }

  //after factory level is increased
  function handleFactoryUpgrade(
    MineComponent mineComponent,
    TileComponent tileComponent,
    BuildingComponent buildingComponent,
    uint256 playerEntity,
    uint256 factoryEntity
  ) internal {
    FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
      getAddressById(components, FactoryIsFunctionalComponentID)
    );
    //if factory was non functional nothing to do
    if (!factoryIsFunctionalComponent.has(factoryEntity)) return;

    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );

    uint256 buildingLevelEntity = LibEncode.hashFromKey(
      tileComponent.getValue(factoryEntity),
      buildingComponent.getValue(factoryEntity)
    );

    updateUnclaimedForResource(
      mineComponent,
      playerEntity,
      factoryProductionComponent.getValue(buildingLevelEntity).ResourceID
    );

    FactoryProductionData memory factoryProductionDataPreUpgrade = factoryProductionComponent.getValue(
      LibEncode.hashKeyEntity(tileComponent.getValue(factoryEntity), buildingComponent.getValue(factoryEntity) - 1)
    );

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionDataPreUpgrade.ResourceID, playerEntity);

    //check to see if factory is still functional after upgrade
    if (
      checkFactoryConnectedMinesLevelCondition(
        factoryIsFunctionalComponent,
        buildingComponent,
        PathComponent(getAddressById(components, PathComponentID)),
        factoryEntity
      )
    ) {
      // if functional increase resource production by the difference in resource production between the two levels
      uint256 resourceProductionIncreaseOfFactory = factoryProductionComponent
        .getValue(buildingLevelEntity)
        .ResourceProductionRate - factoryProductionDataPreUpgrade.ResourceProductionRate;
      mineComponent.set(
        playerResourceEntity,
        mineComponent.getValue(playerResourceEntity) + resourceProductionIncreaseOfFactory
      );
    } else {
      // if not functional remove resource production of the factory and set as non functional
      factoryIsFunctionalComponent.remove(factoryEntity);
      mineComponent.set(
        playerResourceEntity,
        mineComponent.getValue(playerResourceEntity) - factoryProductionDataPreUpgrade.ResourceProductionRate
      );
    }
  }

  // after mine level is increased
  function checkAndUpdateResourceProductionOnUpgradeMine(
    MineComponent mineComponent, //writes to
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    uint256 playerEntity,
    uint256 fromEntity
  ) internal {
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
      tileComponent.getValue(fromEntity),
      buildingComponent.getValue(fromEntity)
    );
    uint256 buildingLevelEntityPreUpgrade = LibEncode.hashKeyEntity(
      tileComponent.getValue(fromEntity),
      buildingComponent.getValue(fromEntity) - 1
    );
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(fromEntity));
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    uint256 resourceProductionIncreaseOfMine = mineComponent.getValue(buildingLevelEntity) -
      mineComponent.getValue(buildingLevelEntityPreUpgrade);
    mineComponent.set(
      playerResourceEntity,
      mineComponent.getValue(playerResourceEntity) + resourceProductionIncreaseOfMine
    );
  }

  function handleMineUpgrade(
    MineComponent mineComponent,
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    uint256 playerEntity,
    uint256 mineEntity
  ) internal {
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    //check if upgraded mine is connected to anything if not nothing to do
    if (pathComponent.has(mineEntity)) {
      //check to see if its connected to MainBase
      if (tileComponent.getValue(pathComponent.getValue(mineEntity)) == MainBaseID) {
        //if connected to MainBase update unclaimed resources up to this point
        updateUnclaimedForResource(
          mineComponent,
          playerEntity,
          LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity))
        );
        //and update resource production
        checkAndUpdateResourceProductionOnUpgradeMine(
          mineComponent,
          buildingComponent,
          tileComponent,
          playerEntity,
          mineEntity
        );
      } else {
        uint256 factoryEntity = pathComponent.getValue(mineEntity);
        FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
          getAddressById(components, FactoryIsFunctionalComponentID)
        );
        //if connected to factory check if factory is functional, if it is mine upgrade has no effect so do nothing
        if (factoryIsFunctionalComponent.has(factoryEntity)) return;

        //if is not functional check if it can be made functional

        FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
          getAddressById(components, FactoryMineBuildingsComponentID)
        );

        // first check if any conncected mines are not at the required level if so do nothing
        uint256 factoryLevel = buildingComponent.getValue(factoryEntity);
        uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
        for (uint256 i = 0; i < connectedMineEntities.length; i++) {
          if (buildingComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
            return;
          }
        }

        FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(
          factoryEntity
        );
        //then check if there are enough connected mines
        for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
          if (factoryMineBuildingsData.MineBuildingCount[i] > 0) return;
        }

        //if all conditions are met make factory functional
        factoryIsFunctionalComponent.set(factoryEntity);
        FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
          getAddressById(components, FactoryProductionComponentID)
        );
        uint256 buildingLevelEntity = LibEncode.hashFromKey(
          tileComponent.getValue(factoryEntity),
          buildingComponent.getValue(factoryEntity)
        );
        //first update unclaimed resources up to this point
        updateUnclaimedForResource(
          mineComponent,
          playerEntity,
          factoryProductionComponent.getValue(buildingLevelEntity).ResourceID
        );
        //then update resource production
        LibFactory.updateResourceProductionOnFactoryIsFunctionalChange(
          factoryProductionComponent,
          mineComponent,
          playerEntity,
          buildingLevelEntity,
          true
        );
      }
    }
  }

  function execute(bytes memory args) public returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), UpgradeSystemID),
      "PostUpgradeSystem: Only UpgradeSystem can call this function"
    );

    (address playerAddress, uint256 entity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));

    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    uint256 newLevel = buildingComponent.getValue(entity);

    uint256 buildingId = tileComponent.getValue(entity);
    uint256 buildingIdLevelEntity = LibEncode.hashFromKey(buildingId, newLevel);
    if (mineComponent.has(buildingIdLevelEntity)) {
      handleMineUpgrade(mineComponent, buildingComponent, tileComponent, playerEntity, entity);
    } else if (factoryMineBuildingsComponent.has(buildingIdLevelEntity)) {
      handleFactoryUpgrade(mineComponent, tileComponent, buildingComponent, playerEntity, entity);
    }
    checkAndUpdatePlayerStorageAfterUpgrade(playerEntity, buildingId, newLevel);
    return abi.encode(entity);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
