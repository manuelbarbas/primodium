// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "systems/BuildSystem.sol";
// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { MaxBuildingsComponent, ID as MaxBuildingsComponentID } from "components/MaxBuildingsComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";

import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";

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
    MaxResourceStorageComponent maxResourceStorageComponent = MaxResourceStorageComponent(
      getC(MaxResourceStorageComponentID)
    );
    uint256 buildingTypeLevel = LibEncode.hashKeyEntity(buildingType, 1);
    if (!maxResourceStorageComponent.has(buildingTypeLevel)) return;
    uint256[] memory storageResources = maxResourceStorageComponent.getValue(buildingTypeLevel);
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
        maxResourceStorageComponent,
        maxStorageComponent,
        playerEntity,
        storageResources[i],
        playerResourceMaxStorage + maxStorageIncrease
      );
    }
  }

  function setupFactory(uint256 factoryEntity) internal {
    MinesComponent minesComponent = MinesComponent(getC(MinesComponentID));
    uint256 buildingId = BuildingTypeComponent(getC(BuildingTypeComponentID)).getValue(factoryEntity);
    uint256 levelEntity = LibEncode.hashKeyEntity(buildingId, 1);
    if (!minesComponent.has(levelEntity)) {
      return;
    }
    ResourceValues memory factoryMines = minesComponent.getValue(levelEntity);
    minesComponent.set(factoryEntity, factoryMines);
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildSystemID),
      "PostUpgradeSystem: Only BuildSystem can call this function"
    );

    (address playerAddress, uint256 buildingEntity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);
    uint256 buildingType = BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID)).getValue(
      buildingEntity
    );

    LibPassiveResource.updatePassiveResourcesBasedOnRequirements(world, playerEntity, buildingType);
    LibPassiveResource.updatePassiveProduction(world, playerEntity, buildingType);
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
