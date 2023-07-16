// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";
import { BuildingLevelComponent, ID as BuildingLevelComponentID } from "components/BuildingLevelComponent.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { FactoryIsFunctionalComponent, ID as FactoryIsFunctionalComponentID } from "components/FactoryIsFunctionalComponent.sol";
import { FactoryProductionComponent, ID as FactoryProductionComponentID, FactoryProductionData } from "components/FactoryProductionComponent.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";

import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.BuildPathFromFactoryToMainBase"));

contract BuildPathFromFactoryToMainBaseSystem is IOnTwoEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  //call after upgrade has been done and level has been increased
  function updateResourceProduction(uint256 playerEntity, uint256 factoryEntity) internal {
    if (!FactoryIsFunctionalComponent(getC(FactoryIsFunctionalComponentID)).has(factoryEntity)) return;
    uint256 buildingId = TileComponent(getC(TileComponentID)).getValue(factoryEntity);
    uint256 buildingLevelEntity = LibEncode.hashKeyEntity(
      buildingId,
      BuildingLevelComponent(getC(BuildingLevelComponentID)).getValue(factoryEntity)
    );
    FactoryProductionData memory factoryProductionData = FactoryProductionComponent(getC(FactoryProductionComponentID))
      .getValue(buildingLevelEntity);
    uint256 playerResourceEntity = LibEncode.hashKeyEntity(factoryProductionData.ResourceID, playerEntity);
    LibResourceProduction.updateResourceProduction(
      world,
      playerResourceEntity,
      LibMath.getSafeUint256Value(MineComponent(getC(MineComponentID)), playerResourceEntity) +
        factoryProductionData.ResourceProductionRate
    );
  }

  //checks if path from mine to factory can be built, if yes updates factory is functional status

  function updateUnclaimedForResource(uint256 playerEntity, uint256 startBuilding) internal {
    LibUnclaimedResource.updateUnclaimedForResource(
      world,
      playerEntity,
      LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(startBuilding))
    );
  }

  function execute(bytes memory args) public override returns (bytes memory) {
    (address playerAddress, uint256 fromBuildingEntity, uint256 toBuildingEntity) = abi.decode(
      args,
      (address, uint256, uint256)
    );

    require(
      msg.sender == getAddressById(world.systems(), BuildPathSystemID),
      "BuildPathFromFactoryToMainBase: Only BuildPathSystem can call this function"
    );

    updateUnclaimedForResource(addressToEntity(playerAddress), fromBuildingEntity);

    updateResourceProduction(addressToEntity(playerAddress), fromBuildingEntity);

    PathComponent(getC(PathComponentID)).set(fromBuildingEntity, toBuildingEntity);
    return abi.encode(fromBuildingEntity);
  }

  function executeTyped(
    address playerAddress,
    uint256 fromBuildingEntity,
    uint256 toBuildingEntity
  ) public returns (bytes memory) {
    return execute(abi.encode(playerAddress, fromBuildingEntity, toBuildingEntity));
  }
}
