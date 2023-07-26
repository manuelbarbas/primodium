// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";

import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";

import { MainBaseID } from "../prototypes.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";
import { LibStorageUpgrade } from "../libraries/LibStorageUpgrade.sol";
import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";

uint256 constant ID = uint256(keccak256("system.PostUpgradeMine"));

contract PostUpgradeMineSystem is IOnEntitySubsystem, System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  // after mine level is increased
  function handleMineUpgradeConnectedToFactory(uint256 playerEntity, uint256 mineEntity) internal {
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));

    uint256 factoryEntity = pathComponent.getValue(mineEntity);
    ActiveComponent activeComponent = ActiveComponent(
      getAddressById(components, ActiveComponentID)
    );
    //if connected to factory check if factory is functional, if it is mine upgrade has no effect so do nothing
    if (activeComponent.has(factoryEntity)) return;

    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(
      getAddressById(components, BuildingLevelComponentID)
    );
    //if is not functional check if it can be made functional

    // first check if any connected mines are not at the required level if so do nothing
    uint256 factoryLevel = buildingLevelComponent.getValue(factoryEntity);
    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingLevelComponent.getValue(connectedMineEntities[i]) < factoryLevel) {
        return;
      }
    }

    FactoryMineBuildingsData memory factoryMineBuildingsData = FactoryMineBuildingsComponent(
      getAddressById(components, FactoryMineBuildingsComponentID)
    ).getValue(factoryEntity);
    //then check if there are enough connected mines
    for (uint256 i = 0; i < factoryMineBuildingsData.MineBuildingCount.length; i++) {
      if (factoryMineBuildingsData.MineBuildingCount[i] > 0) return;
    }

    //if all conditions are met make factory functional
    activeComponent.set(factoryEntity);
    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
      TileComponent(getAddressById(components, TileComponentID)).getValue(factoryEntity),
      buildingLevelComponent.getValue(factoryEntity)
    );
    //first update unclaimed resources up to this point
    LibUnclaimedResource.updateUnclaimedForResource(
      world,
      playerEntity,
      factoryProductionComponent.getValue(buildingLevelEntity).ResourceID
    );

    //then update resource production
    LibFactory.updateResourceProductionOnActiveChange(world, playerEntity, buildingLevelEntity, true);
  }

  function updateResourceProduction(uint256 playerResourceEntity, uint256 mineEntity) internal {
    MineComponent mineComponent = MineComponent(getAddressById(components, MineComponentID));
    uint32 buildingLevel = BuildingLevelComponent(getAddressById(components, BuildingLevelComponentID)).getValue(
      mineEntity
    );
    uint256 tile = TileComponent(getAddressById(components, TileComponentID)).getValue(mineEntity);
    LibResourceProduction.updateResourceProduction(
      world,
      playerResourceEntity,
      mineComponent.getValue(playerResourceEntity) +
        mineComponent.getValue(LibEncode.hashKeyEntity(tile, buildingLevel)) -
        mineComponent.getValue(LibEncode.hashKeyEntity(tile, buildingLevel - 1))
    );
  }

  function handleMineUpgrade(uint256 playerEntity, uint256 mineEntity) internal {
    PathComponent pathComponent = PathComponent(getAddressById(components, PathComponentID));
    //check if upgraded mine is connected to anything if not nothing to do
    if (!pathComponent.has(mineEntity)) return;
    //check to see if its connected to MainBase
    if (
      TileComponent(getAddressById(components, TileComponentID)).getValue(pathComponent.getValue(mineEntity)) ==
      MainBaseID
    ) {
      uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(mineEntity));
      //if connected to MainBase update unclaimed resources up to this point
      LibUnclaimedResource.updateUnclaimedForResource(world, playerEntity, resourceId);
      //and update resource production
      uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
      updateResourceProduction(playerResourceEntity, mineEntity);
    } else {
      handleMineUpgradeConnectedToFactory(playerEntity, mineEntity);
    }
  }

  function execute(bytes memory args) public returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), UpgradeSystemID),
      "PostUpgradeSystem: Only UpgradeSystem can call this function"
    );

    (address playerAddress, uint256 entity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);

    uint32 newLevel = BuildingLevelComponent(getAddressById(components, BuildingLevelComponentID)).getValue(entity);

    uint256 buildingId = TileComponent(getAddressById(components, TileComponentID)).getValue(entity);

    handleMineUpgrade(playerEntity, entity);

    LibStorageUpgrade.checkAndUpdatePlayerStorageAfterUpgrade(world, playerEntity, buildingId, newLevel);
    return abi.encode(entity);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
