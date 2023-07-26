// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import { PrimodiumSystem, IWorld, getAddressById, addressToEntity, entityToAddress } from "systems/internal/PrimodiumSystem.sol";
import { TileComponent, ID as TileComponentID } from "components/TileComponent.sol";
import { PathComponent, ID as PathComponentID } from "components/PathComponent.sol";
import { LevelComponent, ID as LevelComponentID } from "components/LevelComponent.sol";
import { MineComponent, ID as MineComponentID } from "components/MineComponent.sol";

import { LibMath } from "../libraries/LibMath.sol";
import { LibEncode } from "../libraries/LibEncode.sol";
import { LibUnclaimedResource } from "../libraries/LibUnclaimedResource.sol";
import { LibTerrain } from "../libraries/LibTerrain.sol";
import { LibResourceProduction } from "../libraries/LibResourceProduction.sol";

import { ID as BuildPathSystemID } from "./BuildPathSystem.sol";
import { IOnTwoEntitySubsystem } from "../interfaces/IOnTwoEntitySubsystem.sol";

uint256 constant ID = uint256(keccak256("system.BuildPathFromMineToMainBase"));

contract BuildPathFromMineToMainBaseSystem is IOnTwoEntitySubsystem, PrimodiumSystem {
  constructor(IWorld _world, address _components) PrimodiumSystem(_world, _components) {}

  function execute(bytes memory args) public override returns (bytes memory) {
    require(
      msg.sender == getAddressById(world.systems(), BuildPathSystemID),
      "PostUpgradeSystem: Only BuildSystem can call this function"
    );

    (address playerAddress, uint256 fromBuildingEntity, uint256 toBuildingEntity) = abi.decode(
      args,
      (address, uint256, uint256)
    );
    uint256 playerEntity = addressToEntity(playerAddress);
    uint256 resourceId = LibTerrain.getTopLayerKey(LibEncode.decodeCoordEntity(fromBuildingEntity));

    LibUnclaimedResource.updateUnclaimedForResource(world, playerEntity, resourceId);

    uint256 buildingId = TileComponent(getC(TileComponentID)).getValue(fromBuildingEntity);
    uint256 levelEntity = LibEncode.hashKeyEntity(
      buildingId,
      LevelComponent(getC(LevelComponentID)).getValue(fromBuildingEntity)
    );

    MineComponent mineComponent = MineComponent(getC(MineComponentID));

    uint256 playerResourceEntity = LibEncode.hashKeyEntity(resourceId, playerEntity);
    require(mineComponent.has(levelEntity), "Mine level entity not found");
    LibResourceProduction.updateResourceProduction(
      world,
      playerResourceEntity,
      LibMath.getSafeUint32Value(mineComponent, playerResourceEntity) + mineComponent.getValue(levelEntity)
    );

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
