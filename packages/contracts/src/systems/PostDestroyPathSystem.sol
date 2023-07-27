// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "components/LevelComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";
import { ProductionComponent, ID as ProductionComponentID, ResourceValue } from "components/ProductionComponent.sol";
import { MainBaseID } from "../prototypes.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";

import { ID as DestroyPathSystemID } from "./DestroyPathSystem.sol";
import { ID as DestroySystemID } from "./DestroySystem.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.PostDestroyPath"));

contract PostDestroyPathSystem is IOnEntitySubsystem, System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function updateUnclaimedForResource(uint256 playerEntity, uint256 resourceId) internal {
    LibUnclaimedResource.updateUnclaimedForResource(world, playerEntity, resourceId);
  }

  function handleOnDestroyPathFromMineToMainBase(
    MineProductionComponent mineProductionComponent,
    BuildingTypeComponent buildingTypeComponent,
    uint256 playerEntity,
    uint256 mineEntity
  ) internal {
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity));
    // update unclaimed resources
    updateUnclaimedForResource(playerEntity, resourceId);
    // when path from mine to main base is destroyed resource production is reduced by the mines resource production
    LevelComponent levelComponent = LevelComponent(getAddressById(components, BuildingComponentID));

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    LibResourceProduction.updateResourceProduction(
      world,
      playerResourceEntity,
      mineProductionComponent.getValue(playerResourceEntity) -
        mineProductionComponent.getValue(
          LibEncode.hashKeyEntity(buildingTypeComponent.getValue(mineEntity), levelComponent.getValue(mineEntity))
        )
    );
  }

  function handleOnDestroyPathFromMineToFactory(
    MinesComponent minesComponent,
    BuildingTypeComponent buildingTypeComponent,
    LevelComponent levelComponent,
    uint256 playerEntity,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal {
    ActiveComponent activeComponent = ActiveComponent(getAddressById(components, ActiveComponentID));

    ProductionComponent productionComponent = ProductionComponent(getAddressById(components, ProductionComponentID));

    bool isFunctional = activeComponent.has(factoryEntity);
    uint256 factoryLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(factoryEntity),
      levelComponent.getValue(factoryEntity)
    );

    if (isFunctional) {
      // update unclaimed resources
      updateUnclaimedForResource(playerEntity, productionComponent.getValue(factoryLevelEntity).resource);
    }

    //when a path from mine to factory is destroyed, factory becomes non functional
    //and required connected mine building count is increased
    activeComponent.remove(factoryEntity);
    ResourceValues memory factoryMines = minesComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMines.values.length; i++) {
      if (factoryMines.resources[i] == buildingTypeComponent.getValue(mineEntity)) {
        factoryMines.values[i]++;
        factoryMineBuildingsComponent.set(factoryEntity, factoryMines);
        break;
      }
    }

    //if factory was functional player resource production must be cecreased by the resource production of the factory
    if (isFunctional && PathComponent(getAddressById(components, PathComponentID)).has(factoryEntity))
      LibFactory.updateResourceProductionOnActiveChange(world, playerEntity, factoryLevelEntity, false);
  }

  function handleOnDestroyPathFromFactoryToMainBase(
    MineProductionComponent mineProductionComponent,
    LevelComponent levelComponent,
    BuildingTypeComponent buildingTypeComponent,
    uint256 playerEntity,
    uint256 factoryEntity
  ) internal {
    // if factory was non functional before path was destroyed, nothing to change
    if (!ActiveComponent(getAddressById(components, ActiveComponentID)).has(factoryEntity)) return;

    // when path from factory to main base is destroyed, factory becomes non functional
    // and the resource production must be modified

    // first update unclaimed resources so the unclaimed resource value up to this point is calculated
    uint256 factoryLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(factoryEntity),
      levelComponent.getValue(factoryEntity)
    );
    ProductionData memory productionData = ProductionComponent(getAddressById(components, ProductionComponentID))
      .getValue(factoryLevelEntity);
    // update unclaimed resources
    updateUnclaimedForResource(playerEntity, productionData.resource);

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(productionData.ResourceID, playerEntity);
    if (LibMath.getSafeUint32Value(mineProductionComponent, playerResourceEntity) <= 0)
      revert("this should not be possible");
    //update resource production
    LibResourceProduction.updateResourceProduction(
      world,
      playerResourceEntity,
      mineProductionComponent.getValue(playerResourceEntity) - productionData.value
    );
  }

  function execute(bytes memory args) public returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), DestroyPathSystemID) ||
        msg.sender == getAddressById(world.systems(), DestroySystemID),
      "[PostDestroyPathSystem] - Invalid sender. Can only be called from DestroyPathSystem or DestroySystem]"
    );
    (address playerAddress, uint256 startCoordEntity) = abi.decode(args, (address, uint256));
    uint256 endCoordEntity = PathComponent(getAddressById(components, PathComponentID)).getValue(startCoordEntity);

    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );
    LevelComponent levelComponent = LevelComponent(getAddressById(components, BuildingComponentID));

    MineProductionComponent mineProductionComponent = MineProductionComponent(
      getAddressById(components, MineProductionComponentID)
    );

    uint256 startCoordLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(startCoordEntity),
      levelComponent.getValue(startCoordEntity)
    );
    if (mineProductionComponent.has(startCoordLevelEntity)) {
      if (buildingTypeComponent.getValue(endCoordEntity) == MainBaseID) {
        handleOnDestroyPathFromMineToMainBase(
          mineProductionComponent,
          buildingTypeComponent,
          addressToEntity(playerAddress),
          startCoordEntity
        );
      } else {
        handleOnDestroyPathFromMineToFactory(
          MinesComponent(getAddressById(components, MinesComponentID)),
          buildingTypeComponent,
          levelComponent,
          addressToEntity(playerAddress),
          startCoordEntity,
          endCoordEntity
        );
      }
    } else if (MinesComponent(getAddressById(components, MinesComponentID)).has(startCoordLevelEntity)) {
      handleOnDestroyPathFromFactoryToMainBase(
        mineProductionComponent,
        levelComponent,
        buildingTypeComponent,
        addressToEntity(playerAddress),
        startCoordEntity
      );
    }
    return abi.encode(playerAddress, startCoordEntity, endCoordEntity);
  }

  function executeTyped(address playerAddress, uint256 startCoordEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, startCoordEntity));
  }
}
