pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";

import { StorageCapacityComponent, ID as StorageCapacityComponentID } from "components/StorageCapacityComponent.sol";
import { StorageCapacityResourcesComponent, ID as StorageCapacityResourcesComponentID } from "components/StorageCapacityResourcesComponent.sol";

import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { FactoryMineBuildingsComponent, ID as FactoryMineBuildingsComponentID, FactoryMineBuildingsData } from "components/FactoryMineBuildingsComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";

import { MainBaseID } from "../prototypes.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";

import { IOnEntitySubsystem } from "../interfaces/IOnEntitySubsystem.sol";
import { ID as UpgradeSystemID } from "./UpgradeSystem.sol";

uint256 constant ID = uint256(keccak256("system.PostUpgradeFactory"));

contract PostUpgradeFactorySystem is IOnEntitySubsystem, System {
  constructor(IWorld _world, address _components) System(_world, _components) {}

  function checkFactoryConnectedMinesLevelCondition(
    ActiveComponent activeComponent,
    BuildingLevelComponent buildingLevelComponent,
    PathComponent pathComponent,
    uint256 factoryEntity
  ) internal view returns (bool) {
    if (!activeComponent.has(factoryEntity)) return false;
    uint256 factoryLevel = buildingLevelComponent.getValue(factoryEntity);
    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (buildingLevelComponent.getValue(connectedMineEntities[i]) < factoryLevel) return false;
    }
    return true;
  }

  //after factory level is increased
  function handleFactoryUpgrade(uint256 playerEntity, uint256 factoryEntity) internal {
    ActiveComponent activeComponent = ActiveComponent(
      getAddressById(components, ActiveComponentID)
    );
    BuildingLevelComponent buildingLevelComponent = BuildingLevelComponent(
      getAddressById(components, BuildingLevelComponentID)
    );
    TileComponent tileComponent = TileComponent(getAddressById(components, TileComponentID));
    //if factory was non functional nothing to do
    if (!activeComponent.has(factoryEntity)) return;

    FactoryProductionComponent factoryProductionComponent = FactoryProductionComponent(
      getAddressById(components, FactoryProductionComponentID)
    );

    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
      tileComponent.getValue(factoryEntity),
      buildingLevelComponent.getValue(factoryEntity)
    );

    LibUnclaimedResource.updateUnclaimedForResource(
      world,
      playerEntity,
      factoryProductionComponent.getValue(buildingLevelEntity).ResourceID
    );

    FactoryProductionData memory factoryProductionDataPreUpgrade = factoryProductionComponent.getValue(
      LibEncode.hashKeyEntity(tileComponent.getValue(factoryEntity), buildingLevelComponent.getValue(factoryEntity) - 1)
    );

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionDataPreUpgrade.ResourceID, playerEntity);

    //check to see if factory is still functional after upgrade
    if (
      checkFactoryConnectedMinesLevelCondition(
        activeComponent,
        buildingLevelComponent,
        PathComponent(getAddressById(components, PathComponentID)),
        factoryEntity
      )
    ) {
      // if functional increase resource production by the difference in resource production between the two levels

      LibResourceProduction.updateResourceProduction(
        world,
        playerResourceEntity,
        MineComponent(getAddressById(components, MineComponentID)).getValue(playerResourceEntity) +
          (factoryProductionComponent.getValue(buildingLevelEntity).ResourceProductionRate -
            factoryProductionDataPreUpgrade.ResourceProductionRate)
      );
    } else {
      // if not functional remove resource production of the factory and set as non functional
      activeComponent.remove(factoryEntity);
      LibResourceProduction.updateResourceProduction(
        world,
        playerResourceEntity,
        MineComponent(getAddressById(components, MineComponentID)).getValue(playerResourceEntity) -
          factoryProductionDataPreUpgrade.ResourceProductionRate
      );
    }
  }

  function execute(bytes memory args) public returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), UpgradeSystemID),
      "PostUpgradeSystem: Only UpgradeSystem can call this function"
    );

    (address playerAddress, uint256 entity) = abi.decode(args, (address, uint256));
    uint256 playerEntity = addressToEntity(playerAddress);

    handleFactoryUpgrade(playerEntity, entity);

    return abi.encode(entity);
  }

  function executeTyped(address playerAddress, uint256 buildingEntity) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, buildingEntity));
  }
}
