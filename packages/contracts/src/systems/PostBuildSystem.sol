pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "systems/BuildSystem.sol";
// components
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { BuildingTilesComponent, ID as BuildingTilesComponentID } from "components/BuildingTilesComponent.sol";
import { BuildingLimitComponent, ID as BuildingLimitComponentID } from "components/BuildingLimitComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";

import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibStorageUpdate } from "../libraries/LibStorageUpdate.sol";
import { LibClaim } from "../libraries/LibClaim.sol";
import { LibPassiveResource } from "../libraries/LibPassiveResource.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.PostBuild"));

contract PostBuildSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function updatePlayerStorage(uint256 buildingType, uint256 playerEntity) internal {
    StorageCapacityComponent storageCapacityComponent = StorageCapacityComponent(getC(StorageCapacityComponentID));
    StorageCapacityResourcesComponent storageCapacityResourcesComponent = StorageCapacityResourcesComponent(
      getC(StorageCapacityResourcesComponentID)
    );
    uint256 buildingTypeLevel = LibEncode.hashKeyEntity(buildingType, 1);
    if (!storageCapacityResourcesComponent.has(buildingTypeLevel)) return;
    uint256[] memory storageResources = storageCapacityResourcesComponent.getValue(buildingTypeLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint256 playerResourceStorageCapacity = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        playerEntity,
        storageResources[i]
      );
      uint256 storageCapacityIncrease = LibStorage.getEntityStorageCapacityForResource(
        storageCapacityComponent,
        buildingTypeLevel,
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

  function setupFactory(uint256 factoryEntity) internal {
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getC(FactoryMineBuildingsComponentID)
    );
    uint256 buildingId = TileComponent(getC(TileComponentID)).getValue(factoryEntity);
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
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID),
      "PostUpgradeSystem: Only BuildSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);
    uint256 buildingType = TileComponent(getAddressById(components, TileComponentID)).getValue(buildingEntity);

    LibPassiveResource.updatePassiveResourcesBasedOnRequirements(world, playerEntity, buildingType);
    LibPassiveResource.updatePassiveResourceProduction(world, playerEntity, buildingType);
    //set MainBase id for player address for easy lookup

    // update building count if the built building counts towards the build limit
    if (!IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID)).has(buildingType)) {
      BuildingLimitComponent buildingLimitComponent = BuildingLimitComponent(getC(BuildingLimitComponentID));
      buildingLimitComponent.set(playerEntity, LibMath.getSafeUint256Value(buildingLimitComponent, playerEntity) + 1);
    }

    updatePlayerStorage(buildingType, playerEntity);
    setupFactory(buildingEntity);

    return abi.encode(buildingEntity);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
