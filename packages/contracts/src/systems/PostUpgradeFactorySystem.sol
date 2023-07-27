pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";

import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";
import { MinesComponent, ID as MinesComponentID, MinesData } from "components/MinesComponent.sol";
import { ProductionComponent, ID as ProductionComponentID, ProductionData } from "components/ProductionComponent.sol";
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
    LevelComponent levelComponent,
    PathComponent pathComponent,
    uint256 factoryEntity
  ) internal view returns (bool) {
    if (!activeComponent.has(factoryEntity)) return false;
    uint256 factoryLevel = levelComponent.getValue(factoryEntity);
    uint256[] memory connectedMineEntities = pathComponent.getEntitiesWithValue(factoryEntity);
    for (uint256 i = 0; i < connectedMineEntities.length; i++) {
      if (levelComponent.getValue(connectedMineEntities[i]) < factoryLevel) return false;
    }
    return true;
  }

  //after factory level is increased
  function handleFactoryUpgrade(uint256 playerEntity, uint256 factoryEntity) internal {
    ActiveComponent activeComponent = ActiveComponent(getAddressById(components, ActiveComponentID));
    LevelComponent levelComponent = LevelComponent(getAddressById(components, LevelComponentID));
    BuildingTypeComponent buildingTypeComponent = BuildingTypeComponent(
      getAddressById(components, BuildingTypeComponentID)
    );
    //if factory was non functional nothing to do
    if (!activeComponent.has(factoryEntity)) return;

    ProductionComponent productionComponent = ProductionComponent(getAddressById(components, ProductionComponentID));

    uint256 levelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(factoryEntity),
      levelComponent.getValue(factoryEntity)
    );

    LibUnclaimedResource.updateUnclaimedForResource(
      world,
      playerEntity,
      productionComponent.getValue(levelEntity).ResourceID
    );

    ProductionData memory productionDataPreUpgrade = productionComponent.getValue(
      LibEncode.hashKeyEntity(buildingTypeComponent.getValue(factoryEntity), levelComponent.getValue(factoryEntity) - 1)
    );

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(productionDataPreUpgrade.ResourceID, playerEntity);

    //check to see if factory is still functional after upgrade
    if (
      checkFactoryConnectedMinesLevelCondition(
        activeComponent,
        levelComponent,
        PathComponent(getAddressById(components, PathComponentID)),
        factoryEntity
      )
    ) {
      // if functional increase resource production by the difference in resource production between the two levels

      LibResourceProduction.updateResourceProduction(
        world,
        playerResourceEntity,
        MineProductionComponent(getAddressById(components, MineProductionComponentID)).getValue(playerResourceEntity) +
          (productionComponent.getValue(levelEntity).ResourceProductionRate -
            productionDataPreUpgrade.ResourceProductionRate)
      );
    } else {
      // if not functional remove resource production of the factory and set as non functional
      activeComponent.remove(factoryEntity);
      LibResourceProduction.updateResourceProduction(
        world,
        playerResourceEntity,
        MineProductionComponent(getAddressById(components, MineProductionComponentID)).getValue(playerResourceEntity) -
          productionDataPreUpgrade.ResourceProductionRate
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
