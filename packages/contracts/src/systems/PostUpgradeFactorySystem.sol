// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import { System, IWorld } from "solecs/System.sol";
import { getAddressById, addressToEntity } from "solecs/utils.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";

import { MaxStorageComponent, ID as MaxStorageComponentID } from "components/MaxStorageComponent.sol";
import { MaxResourceStorageComponent, ID as MaxResourceStorageComponentID } from "components/MaxResourceStorageComponent.sol";

import { PlayerProductionComponent, ID as PlayerProductionComponentID } from "components/PlayerProductionComponent.sol";
import { MinesComponent, ID as MinesComponentID, ResourceValues } from "components/MinesComponent.sol";
import { BuildingProductionComponent, ID as BuildingProductionComponentID, ResourceValue } from "components/BuildingProductionComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";

import { MainBaseID } from "../prototypes.sol";

import { LibEncode } from "../libraries/LibEncode.sol";
import { LibStorage } from "../libraries/LibStorage.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibResource } from "../libraries/LibResource.sol";

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

    BuildingProductionComponent buildingProductionComponent = BuildingProductionComponent(
      getAddressById(components, BuildingProductionComponentID)
    );

    uint256 levelEntity = LibEncode.hashKeyEntity(
      buildingTypeComponent.getValue(factoryEntity),
      levelComponent.getValue(factoryEntity)
    );

    LibUnclaimedResource.updateResourceClaimed(
      world,
      playerEntity,
      buildingProductionComponent.getValue(levelEntity).resource
    );

    ResourceValue memory productionDataPreUpgrade = buildingProductionComponent.getValue(
      LibEncode.hashKeyEntity(buildingTypeComponent.getValue(factoryEntity), levelComponent.getValue(factoryEntity) - 1)
    );

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(productionDataPreUpgrade.resource, playerEntity);

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

      LibResource.updateResourceProduction(
        world,
        playerResourceEntity,
        PlayerProductionComponent(getAddressById(components, PlayerProductionComponentID)).getValue(
          playerResourceEntity
        ) + (buildingProductionComponent.getValue(levelEntity).value - productionDataPreUpgrade.value)
      );
    } else {
      // if not functional remove resource production of the factory and set as non functional
      activeComponent.remove(factoryEntity);
      LibResource.updateResourceProduction(
        world,
        playerResourceEntity,
        PlayerProductionComponent(getAddressById(components, PlayerProductionComponentID)).getValue(
          playerResourceEntity
        ) - productionDataPreUpgrade.value
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
