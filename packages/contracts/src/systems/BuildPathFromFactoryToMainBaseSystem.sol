// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";

import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { MineProductionComponent, ID as MineProductionComponentID } from "components/MineProductionComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { BuildingTypeComponent, ID as BuildingTypeComponentID } from "components/BuildingTypeComponent.sol";
import { ActiveComponent, ID as ActiveComponentID } from "components/ActiveComponent.sol";
import { ProductionComponent, ID as ProductionComponentID, ResourceValue } from "components/ProductionComponent.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibResource } from "../libraries/LibResource.sol";
import { LibFactory } from "../libraries/LibFactory.sol";
import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.BuildPathFromFactoryToMainBase"));

contract BuildPathFromFactoryToMainBaseSystem is IOnTwoEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    (address playerAddress, uint256 fromBuildingEntity, uint256 toBuildingEntity) = abi.decode(
      args,
      (address, uint256, uint256)
    );

    require(
      msg.sender == getAddressById(world.systems(), BuildPathSystemID),
      "BuildPathFromFactoryToMainBase: Only BuildPathSystem can call this function"
    );

    if (ActiveComponent(getC(ActiveComponentID)).has(fromBuildingEntity)) {
      uint256 playerEntity = addressToEntity(playerAddress);

      uint256 buildingId = BuildingTypeComponent(getC(BuildingTypeComponentID)).getValue(fromBuildingEntity);
      uint256 levelEntity = LibEncode.hashKeyEntity(
        buildingId,
        LevelComponent(getC(LevelComponentID)).getValue(fromBuildingEntity)
      );
      ResourceValue memory productionData = ProductionComponent(getC(ProductionComponentID)).getValue(levelEntity);

      LibUnclaimedResource.updateResourceClaimed(world, playerEntity, productionData.resource);

      LibFactory.updateProduction(world, playerEntity, levelEntity, true);
    }

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
