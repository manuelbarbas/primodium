// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

// external
import { PrimodiumSystem, IWorld, addressToEntity } from "./internal/PrimodiumSystem.sol";

// components
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { BlueprintComponent, ID as BlueprintComponentID } from "components/BlueprintComponent.sol";
import { OwnedByComponent, ID as OwnedByComponentID } from "components/OwnedByComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "components/BuildingTilesComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { LastBuiltAtComponent, ID as LastBuiltAtComponentID } from "components/LastBuiltAtComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";
import { MainBaseInitializedComponent, ID as MainBaseInitializedComponentID } from "components/MainBaseInitializedComponent.sol";
import { ResearchComponent, ID as ResearchComponentID } from "components/ResearchComponent.sol";
import { ItemComponent, ID as ItemComponentID } from "components/ItemComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { RequiredResourcesComponent, ID as RequiredResourcesComponentID } from "components/RequiredResourcesComponent.sol";
import { RequiredResearchComponent, ID as RequiredResearchComponentID } from "components/RequiredResearchComponent.sol";
import { MainBaseBuildingEntityComponent, ID as MainBaseBuildingEntityComponentID } from "components/MainBaseBuildingEntityComponent.sol";

// prototpyes
import { BuildingTileKey, BuildingKey } from "../prototypes/Keys.sol";
import { BuildingKey } from "../prototypes/Keys.sol";

// libraries
import { Coord } from "../types.sol";
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibBuilding } from "../libraries/LibBuilding.sol";
import { LibResourceCost } from "../libraries/LibResourceCost.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibStorageUpdate } from "../libraries/LibStorageUpdate.sol";
import { LibResearch } from "../libraries/LibResearch.sol";

import { MainBaseID } from "../prototypes/Tiles.sol";

uint256 constant ID = uint256(keccak256("system.Build"));

contract BuildSystem is PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function executeTyped(uint256 buildingType, Coord memory coord) public returns (bytes memory) {
    return execute(abi.encode(buildingType, coord));
  }

  function checkAndUpdatePlayerStorageAfterBuild(uint256 buildingId) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(getC(StorageCapacityComponentID));
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getC(StorageCapacityResourcesComponentID)
    );
    uint256 buildingIdLevel = LibEncode.hashKeyEntity(buildingId, 1);
    uint256 playerEntity = addressToEntity(msg.sender);
    if (!storageCapacityResourcesComponent.has(buildingIdLevel)) return;
    uint256[] memory storageResources = storageCapacityResourcesComponent.getValue(buildingIdLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
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
        playerResourceStorageCapacity + storageCapacityIncrease
      );
    }
  }

  function hasResearched(uint256 buildingType) internal view returns (bool) {
    RequiredResearchComponent requiredResearchComponent = RequiredResearchComponent(getC(RequiredResearchComponentID));
    ResearchComponent researchComponent = ResearchComponent(getC(ResearchComponentID));
    return
      LibResearch.hasResearched(
        requiredResearchComponent,
        researchComponent,
        buildingType,
        addressToEntity(msg.sender)
      );
  }

  function hasRequiredResources(uint256 buildingType) internal view returns (bool) {
    RequiredResourcesComponent requiredResourcesComponent = RequiredResourcesComponent(
      getC(RequiredResourcesComponentID)
    );
    ItemComponent itemComponent = ItemComponent(getC(ItemComponentID));
    return
      LibResourceCost.hasRequiredResources(
        requiredResourcesComponent,
        itemComponent,
        buildingType,
        addressToEntity(msg.sender)
      );
  }

  function setupFactoryComponents(TileComponent tileComponent, uint256 factoryEntity) internal {
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getC(FactoryMineBuildingsComponentID)
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

  function execute(bytes memory args) public override returns (bytes memory) {
    (uint256 buildingType, Coord memory coord) = abi.decode(args, (uint256, Coord));
    TileComponent tileComponent = TileComponent(getC(TileComponentID));
    OwnedByComponent ownedByComponent = OwnedByComponent(getC(OwnedByComponentID));
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(getC(BuildingLevelComponentID));
    BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(getC(BuildingLimitComponentID));
    BlueprintComponent blueprintComponent = BlueprintComponent(getC(BlueprintComponentID));
    IgnoreBuildLimitComponent ignoreBuildLimitComponent = IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID));
    MainBaseBuildingEntityComponent mainBaseBuildingEntityComponent = MainBaseBuildingEntityComponent(
      getC(MainBaseBuildingEntityComponentID)
    );

    // Check there isn't another tile there
    uint256 buildingEntity = getBuildingFromCoord(coord);
    uint256 playerEntity = addressToEntity(msg.sender);
    require(buildingEntity == 0, "[BuildSystem] Cannot build on a non-empty coordinate");
    require(
      LibBuilding.canBuildOnTile(tileComponent, buildingType, buildingEntity),
      "[BuildSystem] Cannot build on this tile"
    );
    //check required research
    require(hasResearched(buildingType), "[BuildSystem] You have not researched the required Technology");

    require(hasRequiredResources(buildingType), "[BuildSystem] You do not have the required resources");
    //check build limit
    require(
      LibBuilding.isBuildingLimitMet(
        ignoreBuildLimitComponent,
        buildingLimitComponent,
        buildingLevelComponent,
        mainBaseBuildingEntityComponent,
        playerEntity,
        buildingType
      ),
      "[BuildSystem] build limit reached. upgrade main base or destroy buildings"
    );

    int32[] memory blueprint = blueprintComponent.getValue(buildingType);
    uint256[] memory tiles = new uint256[](blueprint.length / 2);
    for (uint32 i = 0; i < blueprint.length; i += 2) {
      Coord memory relativeCoord = Coord(blueprint[i], blueprint[i + 1]);
      tiles[i / 2] = placeBuildingTile(buildingEntity, coord, relativeCoord);
    }

    // debug buildings are free:  DebugNodeID, MinerID, LithiumMinerID, BulletFactoryID, SiloID
    //  MainBaseID has a special condition called MainBaseInitialized, so that each wallet only has one MainBase
    if (buildingType == MainBaseID) {
      buildingLevelComponent.set(playerEntity, buildingEntity);
      MainBaseInitializedComponent mainBaseInitializedComponent = MainBaseInitializedComponent(
        getC(MainBaseInitializedComponentID)
      );

      if (mainBaseInitializedComponent.has(playerEntity)) {
        revert("[BuildSystem] Cannot build more than one main base per wallet");
      } else {
        mainBaseInitializedComponent.set(playerEntity, buildingEntity);
      }
    }

    //check resource requirements and if ok spend required resources

    //set MainBase id for player address for easy lookup
    if (buildingType == MainBaseID) {
      mainBaseBuildingEntityComponent.set(playerEntity, buildingType);
    }

    // update building count if the built building counts towards the build limit
    if (!ignoreBuildLimitComponent.has(buildingType)) {
      buildingLimitComponent.set(playerEntity, LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity) + 1);
    }
    //set level of building to 1
    buildingLevelComponent.set(buildingEntity, 1);

    tileComponent.set(buildingEntity, buildingType);
    ownedByComponent.set(buildingEntity, playerEntity);

    checkAndUpdatePlayerStorageAfterBuild(buildingType);
    setupFactoryComponents(tileComponent, buildingEntity);
    return abi.encode(buildingEntity);
  }

  function placeBuildingTile(
    uint256 buildingEntity,
    Coord memory baseCoord,
    Coord memory relativeCoord
  ) private returns (uint256 blockEntity) {
    TileComponent tileComponent = TileComponent(getC(TileComponentID));
    Coord memory coord = Coord(baseCoord.x + relativeCoord.x, baseCoord.y + relativeCoord.y);
    blockEntity = LibEncode.encodeCoordEntity(coord, BuildingTileKey);
    require(!tileComponent.has(blockEntity), "[BuildSystem] Cannot build tile on a non-empty coordinate");
    OwnedByComponent(getC(OwnedByComponentID)).set(blockEntity, buildingEntity);
  }
}
