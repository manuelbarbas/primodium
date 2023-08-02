// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { ProductionComponent, ID as ProductionComponentID, ResourceValue } from "components/ProductionComponent.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibResource } from "../libraries/LibResource.sol";

import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";

uint256 constant ID = uint256(keccak256("system.BuildPathFromMineToFactory"));

contract BuildPathFromMineToFactorySystem is IOnTwoEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  //checks if path from mine to factory can be built, if yes updates factory is functional status
  function canBuildPath(uint256 mineEntity, uint256 factoryEntity) internal returns (bool) {
    ActiveComponent activeComponent = ActiveComponent(getC(ActiveComponentID));
    LevelComponent levelComponent = LevelComponent(getC(LevelComponentID));
    MinesComponent minesComponent = MinesComponent(getC(MinesComponentID));
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(getC(BuildingTypeComponentID));

    if (activeComponent.has(factoryEntity)) return false;
    uint256 factoryLevel = levelComponent.getValue(factoryEntity);
    bool isFunctional = true;
    bool isMineConnected = false;
    ResourceValues memory factoryMines = minesComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMines.values.length; i++) {
      if (factoryMines.resources[i] == buildingTypeComponent.getValue(mineEntity)) {
        if (factoryMines.values[i] <= 0) return false;
        factoryMines.values[i]--;
        minesComponent.set(factoryEntity, factoryMines);
        isMineConnected = true;
        if (factoryMines.values[i] > 0) isFunctional = false;
        if (levelComponent.getValue(mineEntity) < factoryLevel) isFunctional = false;
      } else {
        if (factoryMines.values[i] > 0) isFunctional = false;
      }
    }

    uint256[] memory connectedMineEntities = PathComponent(getC(PathComponentID)).getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (levelComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
        isFunctional = false;
        return isMineConnected;
      }
    }

    if (isFunctional) {
      activeComponent.set(factoryEntity);
    }

    return isMineConnected;
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

    uint256 factoryLevelEntity = LibEncode.hashKeyEntity(
      BuildingTypeComponent(getC(BuildingTypeComponentID)).getValue(toBuildingEntity),
      LevelComponent(getAddressById(components, LevelComponentID)).getValue(toBuildingEntity)
    );

    uint256 factoryResourceId = ProductionComponent(getC(ProductionComponentID)).getValue(factoryLevelEntity).resource;

    LibUnclaimedResource.updateResourceClaimed(world, addressToEntity(playerAddress), factoryResourceId);

    require(
      canBuildPath(fromBuildingEntity, toBuildingEntity),
      "[BuildPathSystem] Cannot build path to a the target factory"
    );
    if (
      ActiveComponent(getC(ActiveComponentID)).has(toBuildingEntity) &&
      PathComponent(getC(PathComponentID)).has(toBuildingEntity)
    ) {
      uint256 playerEntity = addressToEntity(playerAddress);

      ResourceValue memory factoryProductionData = ProductionComponent(getC(ProductionComponentID)).getValue(
        factoryLevelEntity
      );

      LibUnclaimedResource.updateResourceClaimed(world, playerEntity, factoryProductionData.resource);

      LibFactory.updateProduction(world, playerEntity, factoryLevelEntity, true);
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
