// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { LevelComponent, ID as BuildingComponentID } from "components/LevelComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
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
    MineComponent mineComponent,
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
      mineComponent.getValue(playerResourceEntity) -
        mineComponent.getValue(
          LibEncode.hashKeyEntity(buildingTypeComponent.getValue(mineEntity), levelComponent.getValue(mineEntity))
        )
    );
  }

  function handleOnDestroyPathFromMineToFactory(
    FactoryMineBuildingsComponent factoryMineBuildingsComponent,
    BuildingTypeComponent buildingTypeComponent,
    LevelComponent levelComponent,
    uint256 playerEntity,
    uint256 mineEntity,
    uint256 factoryEntity
  ) internal {
    ActiveComponent activeComponent = ActiveComponent(getAddressById(components, ActiveComponentID));

    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );

    bool isFunctional = activeComponent.has(factoryEntity);
    uint256 factoryLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(factoryEntity),
      levelComponent.getValue(factoryEntity)
    );

    if (isFunctional) {
      // update unclaimed resources
      updateUnclaimedForResource(playerEntity, factoryProductionComponent.getValue(factoryLevelEntity).ResourceID);
    }

    //when a path from mine to factory is destroyed, factory becomes non functional
    //and required connected mine building count is increased
    activeComponent.remove(factoryEntity);
    FactoryMineBuildingsData memory factoryMineBuildingsData = factoryMineBuildingsComponent.getValue(factoryEntity);
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingIDs[i] == buildingTypeComponent.getValue(mineEntity)) {
        factoryMineBuildingsData.MineBuildingCount[i]++;
        factoryMineBuildingsComponent.set(factoryEntity, factoryMineBuildingsData);
        break;
      }
    }

    //if factory was functional player resource production must be cecreased by the resource production of the factory
    if (isFunctional && PathComponent(getAddressById(components, PathComponentID)).has(factoryEntity))
      LibFactory.updateResourceProductionOnActiveChange(world, playerEntity, factoryLevelEntity, false);
  }

  function handleOnDestroyPathFromFactoryToMainBase(
    MineComponent mineComponent,
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
    FactoryProductionData memory factoryProductionData = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    ).getValue(factoryLevelEntity);
    // update unclaimed resources
    updateUnclaimedForResource(playerEntity, factoryProductionData.ResourceID);

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    if (LibMath.getSafeUint32Value(mineComponent, playerResourceEntity) <= 0) revert("this should not be possible");
    //update resource production
    LibResourceProduction.updateResourceProduction(
      world,
      playerResourceEntity,
      mineComponent.getValue(playerResourceEntity) - factoryProductionData.ResourceProductionRate
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

    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(getAddressById(components, BuildingTypeComponentID));
    LevelComponent levelComponent = LevelComponent(getAddressById(components, BuildingComponentID));

    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));

    uint256 startCoordLevelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(startCoordEntity),
      levelComponent.getValue(startCoordEntity)
    );
    if (mineComponent.has(startCoordLevelEntity)) {
      if (buildingTypeComponent.getValue(endCoordEntity) == MainBaseID) {
        handleOnDestroyPathFromMineToMainBase(
          mineComponent,
          buildingTypeComponent,
          addressToEntity(playerAddress),
          startCoordEntity
        );
      } else {
        handleOnDestroyPathFromMineToFactory(
          FactoryMineBuildingsComponent(getAddressById(components, FactoryMineBuildingsComponentID)),
          buildingTypeComponent,
          levelComponent,
          addressToEntity(playerAddress),
          startCoordEntity,
          endCoordEntity
        );
      }
    } else if (
      FactoryMineBuildingsComponent(getAddressById(components, FactoryMineBuildingsComponentID)).has(
        startCoordLevelEntity
      )
    ) {
      handleOnDestroyPathFromFactoryToMainBase(
        mineComponent,
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
