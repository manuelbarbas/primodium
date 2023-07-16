// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";

import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";

uint256 constant ID = uint256(keccak256("system.BuildPathFromMineToFactory"));

contract BuildPathFromMineToFactorySystem is IOnTwoEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  //checks if path from mine to factory can be built, if yes updates factory is functional status
  function canBuildPath(uint256 mineEntity, uint256 factoryEntity) internal returns (bool) {
    FactoryIsFunctionalComponent factoryIsFunctionalComponent = FactoryIsFunctionalComponent(
      getC(FactoryIsFunctionalComponentID)
    );
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(getC(BuildingLevelComponentID));
    TileComponent tileComponent = TileComponent(getC(TileComponentID));
    FactoryMineBuildingsComponent factoryMineBuildingsComponent = FactoryMineBuildingsComponent(
      getC(FactoryMineBuildingsComponentID)
    );

    if (factoryIsFunctionalComponent.has(factoryEntity)) return false;
    uint256 factoryLevel = buildingLevelComponent.getValue(factoryEntity);
    bool isFunctional = true;
    bool isMineConnected = false;
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingIDs[i] == tileComponent.getValue(mineEntity)) {
        if (factoryMineBuildingsData.MineBuildingCount[i] <= 0) return false;
        factoryMineBuildingsData.MineBuildingCount[i]--;
        factoryMineBuildingsComponent.set(factoryEntity, factoryMineBuildingsData);
        isMineConnected = true;
        if (factoryMineBuildingsData.MineBuildingCount[i] > 0) isFunctional = false;
        if (buildingLevelComponent.getValue(mineEntity) < factoryLevel) isFunctional = false;
      } else {
        if (factoryMineBuildingsData.MineBuildingCount[i] > 0) isFunctional = false;
      }
    }

    uint256[] memory connectedMineEntities = PathComponent(getC(PathComponentID)).getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingLevelComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
        isFunctional = false;
        return isMineConnected;
      }
    }

    if (isFunctional) {
      factoryIsFunctionalComponent.set(factoryEntity);
    }

    return isMineConnected;
  }

  function updateResourceProductionOnBuildPathFromMine(uint256 playerEntity, uint256 fromEntity) internal {
    uint256 buildingId = TileComponent(getC(TileComponentID)).getValue(fromEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
      buildingId,
      BuildingLevelComponent(getC(BuildingLevelComponentID)).getValue(fromEntity)
    );
    MineComponent mineComponent = MineComponent(getC(MineComponentID));
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(fromEntity));
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    require(mineComponent.has(buildingLevelEntity), "Mine level entity not found");
    LibResourceProduction.updateResourceProduction(
      world,
      playerResourceEntity,
      LibMath.getSafeUint256Value(mineComponent, playerResourceEntity) + mineComponent.getValue(buildingLevelEntity)
    );
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildPathSystemID),
      "BuildPathFromMineToFactory: Only BuildPathSystem can call this function"
    );

    (address playerAddress, uint256 fromBuildingEntity, uint256 toBuildingEntity) = abi.decode(
      args,
      (address, uint256, uint256)
    );

    uint256 factoryBuildingLevelEntity = LibEncode.hashKeyEntity(
      TileComponent(getC(TileComponentID)).getValue(toBuildingEntity),
      BuildingLevelComponent(getAddressById(components, BuildingLevelComponentID)).getValue(toBuildingEntity)
    );

    uint256 factoryResourceId = FactoryProductionComponent(getC(FactoryProductionComponentID))
      .getValue(factoryBuildingLevelEntity)
      .ResourceID;

    LibUnclaimedResource.updateUnclaimedForResource(world, addressToEntity(playerAddress), factoryResourceId);

    require(
      canBuildPath(fromBuildingEntity, toBuildingEntity),
      "[BuildPathSystem] Cannot build path to a the target factory"
    );
    if (FactoryIsFunctionalComponent(getC(FactoryIsFunctionalComponentID)).has(toBuildingEntity)) {
      LibFactory.updateResourceProductionOnFactoryIsFunctionalChange(
        world,
        addressToEntity(msg.sender),
        factoryBuildingLevelEntity,
        true
      );
    }
    PathComponent(getC(PathComponentID)).set(fromBuildingEntity, toBuildingEntity);
    return abi.encode(fromBuildingEntity, toBuildingEntity);
  }

  function executeTyped(
    address playerAddress,
    uint256 fromBuildingEntity,
    uint256 toBuildingEntity
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, fromBuildingEntity, toBuildingEntity));
  }
}
