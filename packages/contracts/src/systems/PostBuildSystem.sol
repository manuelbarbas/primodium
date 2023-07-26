// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "systems/BuildSystem.sol";
// components
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "components/MaxBuildingsComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxStorageResourcesComponent, ID as MaxStorageResourcesComponentID } from "components/MaxStorageResourcesComponent.sol";

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
    MaxStorageComponent maxStorageComponent = MaxStorageComponent(getC(MaxStorageComponentID));
    MaxStorageResourcesComponent maxStorageResourcesComponent = MaxStorageResourcesComponent(
      getC(MaxStorageResourcesComponentID)
    );
    uint256 buildingTypeLevel = LibEncode.hashKeyEntity(buildingType, 1);
    if (!maxStorageResourcesComponent.has(buildingTypeLevel)) return;
    uint256[] memory storageResources = maxStorageResourcesComponent.getValue(buildingTypeLevel);
    for (uint256 i = 0; i < storageResources.length; i++) {
      uint32 playerResourceMaxStorage = LibStorage.getEntityMaxStorageForResource(
        maxStorageComponent,
        playerEntity,
        storageResources[i]
      );
      uint32 maxStorageIncrease = LibStorage.getEntityMaxStorageForResource(
        maxStorageComponent,
        buildingTypeLevel,
        storageResources[i]
      );
      LibStorageUpdate.updateMaxStorageOfResourceForEntity(
        maxStorageResourcesComponent,
        maxStorageComponent,
        playerEntity,
        storageResources[i],
        playerResourceMaxStorage + maxStorageIncrease
      );
    }
  }

  function setupFactory(uint256 factoryEntity) internal {
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getC(FactoryMineBuildingsComponentID)
    );
    uint256 buildingId = TileComponent(getC(TileComponentID)).getValue(factoryEntity);
    uint256 levelEntity = LibEncode.hashKeyEntity(buildingId, 1);
    if (!factoryMineBuildingsComponent.has(levelEntity)) {
      return;
    }
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(levelEntity);
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
      MaxBuildingsComponent maxBuildingsComponent = MaxBuildingsComponent(getC(MaxBuildingsComponentID));
      maxBuildingsComponent.set(playerEntity, LibMath.getSafeUint32Value(maxBuildingsComponent, playerEntity) + 1);
    }

    updatePlayerStorage(buildingType, playerEntity);
    setupFactory(buildingEntity);

    return abi.encode(buildingEntity);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
