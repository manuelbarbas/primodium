// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { PrimodiumSystem, IWorld, addressToEntity, getAddressById } from "./internal/PrimodiumSystem.sol";

import { ID as BuildSystemID } from "systems/BuildSystem.sol";
// components
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { ChildrenComponent, ID as ChildrenComponentID } from "components/ChildrenComponent.sol";
import { BuildingCountComponent, ID as BuildingCountComponentID } from "components/BuildingCountComponent.sol";
import { IgnoreBuildLimitComponent, ID as IgnoreBuildLimitComponentID } from "components/IgnoreBuildLimitComponent.sol";
import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";

import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";

// libraries
import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibPassiveResource } from "../libraries/LibPassiveResource.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.PostBuild"));

contract PostBuildSystem is IOnEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

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
    uint32 buildingLevel = LevelComponent(world.getComponent(LevelComponentID)).getValue(buildingEntity);

    LibPassiveResource.updatePassiveResources(world, playerEntity, buildingType, buildingLevel);
    LibPassiveResource.updatePassiveProduction(world, playerEntity, buildingType, buildingLevel);
    //set MainBase id for player address for easy lookup

    // update building count if the built building counts towards the build limit
    if (!IgnoreBuildLimitComponent(getC(IgnoreBuildLimitComponentID)).has(buildingType)) {
      BuildingCountComponent buildingCountComponent = BuildingCountComponent(getC(BuildingCountComponentID));
      buildingCountComponent.set(playerEntity, LibMath.getSafe(buildingCountComponent, playerEntity) + 1);
    }

    setupFactory(buildingEntity);

    return abi.encode(buildingEntity);
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

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
