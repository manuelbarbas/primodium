// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity, entityToAddress } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingComponent, ID as BuildingComponentID } from "components/BuildingComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";

import { BuildingKey } from "../prototypes/Keys.sol";

import { Coord } from "../types.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibResearch } from "../libraries/LibResearch.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";
import { LibStorage } from "../libraries/LibStorage.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function checkResearchRequirements(uint256 blockType) internal view returns (bool) {
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(
      getAddressById(components, RequiredResearchComponentID)
    );
    ResearchComponent researchComponent = ResearchComponent(getAddressById(components, ResearchComponentID));
    return
      LibResearch.checkResearchRequirements(
        requiredResearchComponent,
        researchComponent,
        blockType,
        addressToEntity(msg.sender)
      );
  }

  function checkResourceRequirements(uint256 blockType) internal view returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    return
      LibResourceCost.hasRequiredResources(
        requiredResourcesComponent,
        itemComponent,
        blockType,
        addressToEntity(msg.sender)
      );
  }

  function checkAndSpendResourceRequirements(uint256 blockType) internal returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getAddressById(components, RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getAddressById(components, ItemComponentID));
    return
      LibResourceCost.checkAndSpendRequiredResources(
        requiredResourcesComponent,
        itemComponent,
        blockType,
        addressToEntity(msg.sender)
      );
  }

  function checkAndUpdatePlayerStorageAfterBuild(uint256 buildingId) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(
      getAddressById(components, StorageCapacityComponentID)
    );
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getAddressById(components, StorageCapacityResourcesComponentID)
    );
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingId, 1);
    if (!storageCapacityResourcesComponent.has(buildingIdLevel)) return;
    uint256[] memory storageResources = storageCapacityResourcesComponent.getValue(buildingIdLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageEntity = LibEncode.hashKeyEntity(storageResources[i], addressToEntity(msg.sender));
      uint256 playerResourceStorageCapacity = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        addressToEntity(msg.sender),
        storageResources[i]
      );
      uint256 storageCapacityIncrease = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        buildingIdLevel,
        storageResources[i]
      );
      storageCapacityComponent.set(
        playerResourceStorageEntity,
        playerResourceStorageCapacity + storageCapacityIncrease
      );
    }
  }

  function setupFactoryComponents(TileComponent tileComponent, uint256 factoryEntity) internal {
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    );
    uint256 buildingId = tileComponent.getValue(factoryEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(buildingId, 1);
    if (!factoryMineBuildingsComponent.has(buildingLevelEntity)) {
      return;
    }
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(
      buildingLevelEntity
    );
    factoryMineBuildingsComponent.set(factoryEntity, factoryMineBuildingsData);
  }

  function execute(bytes memory args) public returns (bytes memory) {
    (uint256 blockType, Coord memory coord) = abi.decode(args, (uint256, Coord));
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getAddressById(components, OwnedByComponentID));
    BuildingComponent buildingComponent = BuildingComponent(getAddressById(components, BuildingComponentID));
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(
      getAddressById(components, BuildingLimitComponentID)
    );
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(
      getAddressById(components, IgnoreBuildLimitComponentID)
    );

    // Check there isn't another tile there
    uint256 entity = LibEncode.encodeCoordEntity(coord, BuildingKey);
    require(!tileComponent.has(entity), "[BuildSystem] Cannot build on a non-empty coordinate");

    require(
      LibBuilding.checkCanBuildOnTile(tileComponent, blockType, entity),
      "[BuildSystem] Cannot build on this tile"
    );
    //check required research
    require(checkResearchRequirements(blockType), "[BuildSystem] You have not researched the required Technology");

    //check build limit
    require(
      LibBuilding.checkBuildLimitConditionForBuildingId(
        ignoreBuildLimitComponent,
        buildingLimitComponent,
        buildingComponent,
        addressToEntity(msg.sender),
        blockType
      ),
      "[BuildSystem] build limit reached. upgrade main base or destroy buildings"
    );

    // debug buildings are free:  DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, SiloID
    //  MainBaseID has a special condition called MainBaseInitialized, so that each wallet only has one MainBase
    if (blockType == MainBaseID) {
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getAddressById(components, MainBaseInitializedComponentID)
      );

      if (mainBaseInitializedComponent.has(addressToEntity(msg.sender))) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseInitializedComponent.set(addressToEntity(msg.sender), coord);
      }
    }

    //check resource requirements and if ok spend required resources
    require(checkAndSpendResourceRequirements(blockType), "[BuildSystem] You do not have the required resources");

    //set MainBase id for player address for easy lookup
    if (blockType == MainBaseID) {
      buildingComponent.set(addressToEntity(msg.sender), entity);
    }

    // update building count if the built building counts towards the build limit
    if (LibBuilding.doesTileCountTowardsBuildingLimit(ignoreBuildLimitComponent, blockType)) {
      buildingLimitComponent.set(
        addressToEntity(msg.sender),
        LibMath.getSafeUint256Value(buildingLimitComponent, addressToEntity(msg.sender)) + 1
      );
    }
    //set level of building to 1
    buildingComponent.set(entity, 1);

    tileComponent.set(entity, blockType);
    ownedByComponent.set(entity, addressToEntity(msg.sender));

    checkAndUpdatePlayerStorageAfterBuild(blockType);
    setupFactoryComponents(tileComponent, entity);
    return abi.encode(entity);
  }

  function executeTyped(uint256 blockType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(blockType, coord));
  }
}
