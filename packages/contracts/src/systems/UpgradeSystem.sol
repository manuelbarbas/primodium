// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";

import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
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
import { BuildingKey } from "../prototypes/Keys.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

import { Coord } from "../types.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUpgrade } from "../libraries/LibUpgrade.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibNewMine } from "../libraries/LibNewMine.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibClaim } from "../libraries/LibClaim.sol";
uint256 constant ID = uint256(keccak256("system.Upgrade"));

contract UpgradeSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(MineComponent mineComponent, uint256 resourceId) internal {
    LibClaim.updateUnclaimedForResource(
      UnclaimedResourceComponent(getAddressById(components, UnclaimedResourceComponentID)),
      LastClaimedAtComponent(getAddressById(components, LastClaimedAtComponentID)),
      mineComponent,
      StorageCapacityComponent(getAddressById(components, StorageCapacityComponentID)),
      ItemComponent(getAddressById(components, ItemComponentID)),
      addressToEntity(msg.sender),
      resourceId
    );
  }

  //after building level is increased
  function checkAndUpdatePlayerStorageAfterUpgrade(uint256 buildingId, uint256 newLevel) internal {
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
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], addressToEntity(msg.sender));
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

  //after factory level is increased
  function handleFactoryUpgrade(
    MineComponent mineComponent,
    TileComponent tileComponent,
    BuildingComponent buildingComponent,
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

    updateUnclaimedForResource(mineComponent, factoryProductionComponent.getValue(buildingLevelEntity).ResourceID);

    FactoryProductionData memory factoryProductionDataPreUpgrade = factoryProductionComponent.getValue(
      LibEncode.hashKeyEntity(tileComponent.getValue(factoryEntity), buildingComponent.getValue(factoryEntity) - 1)
    );

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(
      factoryProductionDataPreUpgrade.ResourceID,
      addressToEntity(msg.sender)
    );

    //check to see if factory is still functional after upgrade
    if (
      LibFactory.checkFactoryConnectedMinesLevelCondition(
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
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, addressToEntity(msg.sender));
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
    uint256 mineEntity
  ) internal {
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    //check if upgraded mine is connected to anything if not nothing to do
    if (pathComponent.has(mineEntity)) {
      //check to see if its connected to MainBase
      if (tileComponent.getValue(pathComponent.getValue(mineEntity)) == MainBaseID) {
        //if connected to MainBase update unclaimed resources up to this point
        updateUnclaimedForResource(mineComponent, LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity)));
        //and update resource production
        checkAndUpdateResourceProductionOnUpgradeMine(mineComponent, buildingComponent, tileComponent, mineEntity);
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
        updateUnclaimedForResource(mineComponent, factoryProductionComponent.getValue(buildingLevelEntity).ResourceID);
        //then update resource production
        LibFactory.updateResourceProductionOnFactoryIsFunctionalChange(
          factoryProductionComponent,
          mineComponent,
          addressToEntity(msg.sender),
          buildingLevelEntity,
          true
        );
      }
    }
  }

  function handlePostUpgradeCallbacks(
    BuildingComponent buildingComponent,
    TileComponent tileComponent,
    uint256 entity,
    uint256 buildingId
  ) internal {
    uint256 newLevel = buildingComponent.getValue(entity);
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));

    uint256 buildingIdLevelEntity = LibEncode.hashFromKey(buildingId, newLevel);
    if (mineComponent.has(buildingIdLevelEntity)) {
      handleMineUpgrade(mineComponent, buildingComponent, tileComponent, entity);
    } else if (factoryMineBuildingsComponent.has(buildingIdLevelEntity)) {
      handleFactoryUpgrade(mineComponent, tileComponent, buildingComponent, entity);
    }
    checkAndUpdatePlayerStorageAfterUpgrade(buildingId, newLevel);
  }

  function execute(bytes memory args) public returns (bytes memory) {
    Coord memory coord = abi.decode(args, (Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));

    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));

    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );

    // Check there isn't another tile there
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(tileComponent.has(entity), "[DestroySystem] Cannot destroy tile at an empty coordinate");

    require(buildingComponent.has(entity), "[UpgradeSystem] Cannot upgrade a non-building");
    uint256 ownerKey = addressToEntity(msg.sender);
    require(
      ownedByComponent.getValue(entity) == ownerKey,
      "[UpgradeSystem] Cannot upgrade a building that is not owned by you"
    );
    uint256 blockType = tileComponent.getValue(entity);
    require(
      LibUpgrade.checkUpgradeResearchRequirements(
        buildingComponent,
        requiredResearchComponent,
        researchComponent,
        blockType,
        entity,
        addressToEntity(msg.sender)
      ),
      "[UpgradeSystem] Cannot upgrade a building that does not meet research requirements"
    );
    require(
      LibUpgrade.checkAndSpendUpgradeResourceRequirements(
        buildingComponent,
        requiredResourcesComponent,
        itemComponent,
        blockType,
        entity,
        addressToEntity(msg.sender)
      ),
      "[UpgradeSystem] Cannot upgrade a building that does not meet resource requirements"
    );
    uint256 newLevel = buildingComponent.getValue(entity) + 1;
    buildingComponent.set(entity, newLevel);

    handlePostUpgradeCallbacks(buildingComponent, tileComponent, entity, blockType);
    return abi.encode(entity);
  }

  function executeTyped(Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(coord));
  }
}
